#!/bin/bash

# KnowledgeAI Backend Startup Script

echo "🚀 Starting KnowledgeAI Backend..."

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Virtual environment not activated. Activating..."
    source ../RPF/bin/activate
fi

# Install/upgrade dependencies
echo "📦 Installing dependencies..."
pip install -r ../requirements.txt

# Run database initialization if needed
if [ ! -f ".db_initialized" ]; then
    echo "🗄️  Initializing database..."
    python init_db.py
    touch .db_initialized
fi

# Create upload directory
mkdir -p uploads
mkdir -p chroma_db

# Start the server
echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
