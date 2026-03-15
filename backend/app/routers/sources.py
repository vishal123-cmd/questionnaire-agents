"""
Sources Router - Knowledge Base Management
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from pathlib import Path

from app.database import get_db
from app.schemas import SourceCreate, SourceResponse, SourceStatus
from app.models import Source, Workspace, User
from app.config import settings

router = APIRouter()


SYSTEM_USER_EMAIL = "system@knowledgeai.local"


def ensure_system_user(db: Session) -> User:
    user = db.query(User).filter(User.email == SYSTEM_USER_EMAIL).first()
    if user:
        return user
    user = User(
        email=SYSTEM_USER_EMAIL,
        hashed_password="disabled",
        full_name="System User",
        is_active=True,
        is_superuser=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_default_workspace(db: Session = Depends(get_db)) -> Workspace:
    """Get or create the default workspace"""
    workspace = db.query(Workspace).first()
    if not workspace:
        system_user = ensure_system_user(db)
        # Create a default workspace if none exists
        workspace = Workspace(
            name="Default Workspace",
            owner_id=system_user.id,
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
    return workspace


@router.get("", response_model=List[SourceResponse])
async def list_sources(
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Get all sources for the current workspace"""
    sources = db.query(Source).filter(Source.workspace_id == workspace.id).all()
    return sources


@router.post("/upload", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """
    Upload a file to the knowledge base
    Supported formats: PDF, DOCX, TXT, MD, CSV, XLSX
    """
    # Validate file type
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type .{file_ext} not supported"
        )
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR) / str(workspace.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = file_path.stat().st_size
    
    # Create source record
    source = Source(
        workspace_id=workspace.id,
        name=file.filename,
        type="file",
        status="pending",
        file_path=str(file_path),
        file_size=file_size,
        file_type=file_ext
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    
    # TODO: Trigger background task for indexing with Celery
    # ingest_document.delay(source.id)
    
    return source


@router.post("/url", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def add_url_source(
    source_data: SourceCreate,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Add a URL as a knowledge source"""
    if not source_data.url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is required"
        )
    
    source = Source(
        workspace_id=workspace.id,
        name=source_data.name,
        type="url",
        status="pending",
        url=source_data.url
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    
    # TODO: Trigger background task for web scraping
    # scrape_url.delay(source.id)
    
    return source


@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(
    source_id: int,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Get a specific source by ID"""
    source = db.query(Source).filter(
        Source.id == source_id,
        Source.workspace_id == workspace.id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(
    source_id: int,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Delete a source and its associated data"""
    source = db.query(Source).filter(
        Source.id == source_id,
        Source.workspace_id == workspace.id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    # Delete file if it exists
    if source.file_path and os.path.exists(source.file_path):
        os.remove(source.file_path)
    
    # TODO: Delete from vector store
    # vector_store.delete_source(source_id, workspace.id)
    
    db.delete(source)
    db.commit()
    
    return None


@router.get("/{source_id}/status", response_model=SourceStatus)
async def get_source_status(
    source_id: int,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Get the current indexing status of a source"""
    source = db.query(Source).filter(
        Source.id == source_id,
        Source.workspace_id == workspace.id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    return {
        "id": source.id,
        "status": source.status,
        "chunk_count": source.chunk_count,
        "error_message": source.error_message
    }
