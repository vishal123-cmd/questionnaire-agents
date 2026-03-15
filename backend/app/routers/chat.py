"""
Chat Router - AI-powered Q&A with citations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.schemas import ChatQuery, ChatResponse, ConversationResponse, MessageFeedback
from app.models import Workspace, Conversation, Message, MessageRole
from app.routers.sources import get_default_workspace

router = APIRouter()


@router.post("/query")
async def chat_query(
    query_data: ChatQuery,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """
    Ask a question and get an AI-powered answer with citations
    Returns streaming response via Server-Sent Events (SSE)
    """
    # Get or create conversation
    if query_data.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == query_data.conversation_id,
            Conversation.workspace_id == workspace.id
        ).first()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    else:
        # Create new conversation
        conversation = Conversation(
            workspace_id=workspace.id,
            user_id=workspace.owner_id,
            title=query_data.query[:50]  # Use first 50 chars as title
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    
    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.USER,
        content=query_data.query
    )
    db.add(user_message)
    db.commit()
    
    # TODO: Implement RAG pipeline with streaming
    # For now, return a placeholder response
    async def generate_response():
        # Placeholder response
        answer = "This is a placeholder response. The RAG pipeline will be implemented in Phase 3."
        sources = []
        
        # Stream the response
        yield f"data: {json.dumps({'type': 'start', 'conversation_id': conversation.id})}\n\n"
        
        # Stream answer chunks
        for chunk in answer.split():
            yield f"data: {json.dumps({'type': 'token', 'content': chunk + ' '})}\n\n"
        
        # Send sources
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
        
        # End stream
        yield f"data: {json.dumps({'type': 'end'})}\n\n"
        
        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=answer,
            sources_json=sources
        )
        db.add(assistant_message)
        db.commit()
    
    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream"
    )


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current workspace"""
    conversations = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id
    ).order_by(Conversation.updated_at.desc()).all()
    
    result = []
    for conv in conversations:
        message_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
        result.append({
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at,
            "message_count": message_count
        })
    
    return result


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: int,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Get all messages in a conversation"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.workspace_id == workspace.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()
    
    return messages


@router.post("/{message_id}/feedback")
async def submit_feedback(
    message_id: int,
    feedback_data: MessageFeedback,
    workspace: Workspace = Depends(get_default_workspace),
    db: Session = Depends(get_db)
):
    """Submit thumbs up/down feedback for a message"""
    message = db.query(Message).join(Conversation).filter(
        Message.id == message_id,
        Conversation.workspace_id == workspace.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.feedback = feedback_data.feedback
    db.commit()
    
    return {"status": "success", "feedback": feedback_data.feedback}
