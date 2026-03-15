# KnowledgeAI - AI-Powered Knowledge Base Platform

> A production-grade SaaS application for building AI-powered knowledge bases with instant Q&A, document management, and questionnaire automation.

## 🎯 Overview

KnowledgeAI is a comprehensive platform that allows companies to:
- **Connect documents and data sources** (PDFs, URLs, Google Drive, Confluence)
- **Get instant AI-powered answers** with source citations
- **Auto-fill questionnaires and RFPs** using your knowledge base
- **Manage knowledge** across your organization

Inspired by platforms like 1up.ai, built with modern AI and RAG (Retrieval-Augmented Generation) technology.

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy + PostgreSQL** - Relational database
- **LangChain** - RAG pipeline orchestration
- **LlamaIndex** - Document indexing and chunking
- **OpenAI GPT-4o** - Large language model
- **ChromaDB** - Vector database for embeddings
- **Redis + Celery** - Background job processing
- **JWT** - Authentication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **TanStack Query** - Server state
- **Axios** - API client

## 📦 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Setup

1. **Create virtual environment:**
```bash
python -m venv RPF
source RPF/bin/activate  # On Windows: RPF\\Scripts\\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database:**
```bash
cd backend
python init_db.py
```

5. **Start backend server:**
```bash
chmod +x start.sh
./start.sh
# Or manually: uvicorn app.main:app --reload --port 8000
```

Backend will run on http://localhost:8000
API docs available at http://localhost:8000/docs

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit if needed (defaults to http://localhost:8000)
```

3. **Start development server:**
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## 🗄️ Database Setup

### PostgreSQL

Create a database:
```sql
CREATE DATABASE knowledgeai;
CREATE USER knowledgeai WITH PASSWORD 'knowledgeai123';
GRANT ALL PRIVILEGES ON DATABASE knowledgeai TO knowledgeai;
```

Or use Docker:
```bash
docker run --name knowledgeai-postgres \
  -e POSTGRES_DB=knowledgeai \
  -e POSTGRES_USER=knowledgeai \
  -e POSTGRES_PASSWORD=knowledgeai123 \
  -p 5432:5432 \
  -d postgres:14
```

### Redis

Using Docker:
```bash
docker run --name knowledgeai-redis \
  -p 6379:6379 \
  -d redis:7
```

## 🚀 Quick Start

1. **Start all services:**
```bash
# Terminal 1: PostgreSQL (if using Docker)
docker start knowledgeai-postgres

# Terminal 2: Redis
docker start knowledgeai-redis

# Terminal 3: Backend
cd backend && ./start.sh

# Terminal 4: Frontend
cd frontend && npm run dev
```

2. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

3. **Login with demo account:**
```
Email: demo@knowledgeai.com
Password: demo123
```

## 📚 Features

### ✅ Phase 1 - Foundation (Completed)
- ✅ Backend API with FastAPI
- ✅ Database models (Users, Workspaces, Sources, Conversations)
- ✅ JWT authentication
- ✅ Frontend with React + TypeScript
- ✅ Login/Register pages
- ✅ Dashboard with stats
- ✅ Knowledge management UI
- ✅ Chat interface
- ✅ Questionnaire upload UI

### 🚧 Phase 2 - Knowledge Ingestion (In Progress)
- [ ] LlamaIndex document processing
- [ ] ChromaDB vector storage
- [ ] Background job processing with Celery
- [ ] File upload and indexing
- [ ] URL web scraping
- [ ] Real-time indexing status

### 🚧 Phase 3 - AI Chat (Next)
- [ ] LangChain RAG pipeline
- [ ] OpenAI integration
- [ ] Streaming responses (SSE)
- [ ] Citation extraction
- [ ] Source attribution
- [ ] Feedback system

### 🚧 Phase 4 - Questionnaire
- [ ] CSV/XLSX parsing
- [ ] Batch question processing
- [ ] Answer generation
- [ ] Results export

### 🚧 Phase 5 - Advanced Features
- [ ] Google Drive integration
- [ ] Confluence integration
- [ ] Cohere reranking
- [ ] Advanced analytics
- [ ] Multi-workspace support
- [ ] Team collaboration

## 📂 Project Structure

```
knowledgeai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # Database setup
│   │   ├── models/              # SQLAlchemy models
│   │   ├── routers/             # API routes
│   │   ├── services/            # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── ingestion/       # Document processing
│   │   │   ├── retrieval/       # RAG pipeline
│   │   │   └── llm/             # LLM services
│   │   └── schemas.py           # Pydantic models
│   ├── init_db.py               # Database initialization
│   └── start.sh                 # Startup script
├── frontend/
│   ├── src/
│   │   ├── pages/               # React pages
│   │   ├── components/          # Reusable components
│   │   ├── api/                 # API client
│   │   ├── store/               # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   └── lib/                 # Utilities
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt
├── .env.example
└── README.md
```

## 🔧 Configuration

### Required Environment Variables

**Backend (.env):**
```env
# OpenAI (Required)
OPENAI_API_KEY=sk-your-key-here

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/knowledgeai

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Development

### Backend Development

Run with auto-reload:
```bash
cd backend
uvicorn app.main:app --reload
```

Run tests:
```bash
pytest
```

### Frontend Development

Development server:
```bash
cd frontend
npm run dev
```

Build for production:
```bash
npm run build
```

## 📖 API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🐳 Docker Deployment

Coming soon: Docker Compose setup for easy deployment.

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection protection via SQLAlchemy ORM
- Environment-based configuration

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Contact the maintainer for contribution guidelines.

## 📧 Support

For support, email: support@knowledgeai.com

## 🎯 Roadmap

- [x] Core authentication and database setup
- [x] Frontend UI and routing
- [ ] Document ingestion pipeline
- [ ] RAG-based Q&A system
- [ ] Questionnaire automation
- [ ] Google Drive integration
- [ ] Confluence integration
- [ ] Advanced analytics
- [ ] Enterprise features

---

Built with ❤️ using FastAPI, React, LangChain, and LlamaIndex
│   │   ├── styles/       # CSS files
│   │   └── App.jsx       # Main app
│   └── package.json
├── backend/              # (To be created) FastAPI backend
├── RPF/                  # Python virtual environment
├── PROJECT_ROADMAP.md    # Detailed roadmap
└── README.md             # This file
```

## 🛠️ Getting Started

### Frontend

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   - Navigate to `http://localhost:5173`

### Backend (Coming Soon)

The backend will be built with Python FastAPI. See [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) for details.

## 📝 Next Steps

See [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) for the complete roadmap.

**Immediate next steps:**

1. **Create Backend API**
   - Set up FastAPI project
   - Configure database
   - Implement authentication
   - Create questionnaire endpoints

2. **Connect Frontend to Backend**
   - Update API URLs
   - Test data flow
   - Implement error handling

3. **Add AI Features**
   - Set up OpenAI/Anthropic API
   - Implement question generation
   - Add sentiment analysis

## 🎨 Features

### Current
- ✅ Modern, responsive UI
- ✅ Dashboard with statistics
- ✅ Questionnaire builder with multiple question types
- ✅ Analytics visualization
- ✅ Sidebar navigation

### Planned
- ⏳ User authentication
- ⏳ AI question generation
- ⏳ Response collection
- ⏳ Real-time analytics
- ⏳ Export functionality
- ⏳ Email notifications
- ⏳ Collaboration features
- ⏳ Custom branding

## 🤝 Contributing

This is a personal project, but contributions are welcome!

## 📄 License

MIT License

---

**Note:** This project is currently in active development. The frontend is complete, and the backend implementation is the next major milestone.

