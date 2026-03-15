"""
Pydantic schemas for API request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============= Workspace Schemas =============

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None


class WorkspaceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= Source Schemas =============

class SourceCreate(BaseModel):
    name: str
    type: str  # file, url, gdrive, confluence
    url: Optional[str] = None


class SourceResponse(BaseModel):
    id: int
    workspace_id: int
    name: str
    type: str
    status: str
    file_path: Optional[str]
    url: Optional[str]
    file_size: Optional[int]
    file_type: Optional[str]
    chunk_count: int
    last_synced_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class SourceStatus(BaseModel):
    id: int
    status: str
    chunk_count: int
    error_message: Optional[str]


# ============= Chat Schemas =============

class ChatQuery(BaseModel):
    conversation_id: Optional[int] = None
    query: str = Field(..., min_length=1, max_length=5000)
    source_ids: Optional[List[int]] = None  # Filter by specific sources


class ChatSource(BaseModel):
    """Citation information for chat response"""
    source_id: int
    source_name: str
    chunk_text: str
    page: Optional[int] = None
    score: float


class ChatResponse(BaseModel):
    conversation_id: int
    message_id: int
    answer: str
    sources: List[ChatSource]
    confidence: float


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    message_count: int
    
    class Config:
        from_attributes = True


class MessageFeedback(BaseModel):
    feedback: str  # "up" or "down"


# ============= Questionnaire Schemas =============

class QuestionnaireUpload(BaseModel):
    question_column: str = "question"  # Column name containing questions


class QuestionnaireAnswer(BaseModel):
    question: str
    answer: str
    source_name: Optional[str]
    confidence: float


class QuestionnaireResponse(BaseModel):
    id: int
    filename: str
    status: str
    question_count: int
    answered_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuestionnaireResults(BaseModel):
    id: int
    filename: str
    status: str
    results: List[QuestionnaireAnswer]
    
    class Config:
        from_attributes = True
