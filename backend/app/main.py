"""
KnowledgeAI - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.routers import sources, chat, questionnaire


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup: Create database tables
    # In production, use Alembic migrations instead
    # Base.metadata.create_all(bind=engine)
    print("🚀 KnowledgeAI starting up...")
    yield
    # Shutdown
    print("👋 KnowledgeAI shutting down...")


app = FastAPI(
    title="KnowledgeAI API",
    description="AI-powered Knowledge Base and Q&A Platform (No Auth)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (auth removed)
app.include_router(sources.router, prefix="/api/sources", tags=["Knowledge Sources"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(questionnaire.router, prefix="/api/questionnaire", tags=["Questionnaire"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": "KnowledgeAI",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "vector_store": "connected"
    }
