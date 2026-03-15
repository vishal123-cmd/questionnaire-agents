"""
Questionnaire Router - Auto-fill RFPs and questionnaires
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from pathlib import Path
import shutil

from app.database import get_db
from app.schemas import QuestionnaireResponse, QuestionnaireResults
from app.models import Workspace, Questionnaire
from app.routers.sources import get_default_workspace
from app.config import settings

router = APIRouter()


@router.post("/upload", response_model=QuestionnaireResponse, status_code=status.HTTP_201_CREATED)
async def upload_questionnaire(
    file: UploadFile = File(...),
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """
    Upload a questionnaire file (CSV or XLSX) for auto-filling
    """
    # Validate file type
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["csv", "xlsx", "xls"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV and XLSX files are supported"
        )
    
    # Create upload directory
    upload_dir = Path(settings.UPLOAD_DIR) / "questionnaires" / str(workspace.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Parse file to count questions
    try:
        if file_ext == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
        
        question_count = len(df)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing file: {str(e)}"
        )
    
    # Create questionnaire record
    questionnaire = Questionnaire(
        workspace_id=workspace.id,
        filename=file.filename,
        file_path=str(file_path),
        status="pending",
        question_count=question_count,
        answered_count=0
    )
    db.add(questionnaire)
    db.commit()
    db.refresh(questionnaire)
    
    # TODO: Trigger background task to process questionnaire
    # process_questionnaire.delay(questionnaire.id)
    
    return questionnaire


@router.get("/{questionnaire_id}/status", response_model=QuestionnaireResponse)
async def get_questionnaire_status(
    questionnaire_id: int,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Get the processing status of a questionnaire"""
    questionnaire = db.query(Questionnaire).filter(
        Questionnaire.id == questionnaire_id,
        Questionnaire.workspace_id == workspace.id
    ).first()
    
    if not questionnaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questionnaire not found"
        )
    
    return questionnaire


@router.get("/{questionnaire_id}/results", response_model=QuestionnaireResults)
async def get_questionnaire_results(
    questionnaire_id: int,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Get the results of a processed questionnaire"""
    questionnaire = db.query(Questionnaire).filter(
        Questionnaire.id == questionnaire_id,
        Questionnaire.workspace_id == workspace.id
    ).first()
    
    if not questionnaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questionnaire not found"
        )
    
    if questionnaire.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Questionnaire processing not completed yet"
        )
    
    return {
        "id": questionnaire.id,
        "filename": questionnaire.filename,
        "status": questionnaire.status,
        "results": questionnaire.result_json or []
    }


@router.get("/{questionnaire_id}/export")
async def export_questionnaire(
    questionnaire_id: int,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Export questionnaire results as XLSX file"""
    # TODO: Implement XLSX export
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Export feature coming soon"
    )
