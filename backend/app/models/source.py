"""
Source model for knowledge base documents
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class SourceType(str, enum.Enum):
    """Types of knowledge sources"""
    FILE = "file"
    URL = "url"
    GDRIVE = "gdrive"
    CONFLUENCE = "confluence"
    NOTION = "notion"


class SourceStatus(str, enum.Enum):
    """Source processing status"""
    PENDING = "pending"
    INDEXING = "indexing"
    INDEXED = "indexed"
    ERROR = "error"


class Source(Base):
    __tablename__ = "sources"
    
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(SourceType), nullable=False)
    status = Column(Enum(SourceStatus), default=SourceStatus.PENDING)
    file_path = Column(String, nullable=True)  # Local path or S3 URL
    url = Column(String, nullable=True)  # For URL sources
    file_size = Column(Integer, nullable=True)  # Size in bytes
    file_type = Column(String, nullable=True)  # pdf, docx, etc.
    metadata_json = Column(JSON, nullable=True)  # Additional metadata
    error_message = Column(Text, nullable=True)  # Error details if status=ERROR
    chunk_count = Column(Integer, default=0)  # Number of chunks indexed
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workspace = relationship("Workspace", back_populates="sources")
