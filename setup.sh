#!/bin/bash

# KnowledgeAI - Complete Setup Script

echo "🚀 KnowledgeAI Complete Setup"
echo "=============================="

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is running."
fi

if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis client not found. Make sure Redis is running."
fi

echo "✅ Prerequisites check passed"
echo ""

# Backend setup
echo "📦 Setting up backend..."
if [ ! -d "RPF" ]; then
    python3 -m venv RPF
    echo "✅ Virtual environment created"
fi

source RPF/bin/activate
pip install -r requirements.txt
echo "✅ Backend dependencies installed"
echo ""

# Environment files
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env file - Please configure it with your API keys"
fi

# Database initialization
read -p "Initialize database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    python init_db.py
    cd ..
    echo "✅ Database initialized"
fi
echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created frontend .env file"
fi

npm install
echo "✅ Frontend dependencies installed"
cd ..
echo ""

# Summary
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env file with your OpenAI API key"
echo "2. Make sure PostgreSQL and Redis are running"
echo "3. Start backend: cd backend && ./start.sh"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "Access the application at http://localhost:5173"
echo "API docs at http://localhost:8000/docs"
