# 🚀 QUICK START GUIDE

## Prerequisites Installation

### 1. Install PostgreSQL
**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Create Database:**
```bash
psql postgres
CREATE DATABASE knowledgeai;
CREATE USER knowledgeai WITH PASSWORD 'knowledgeai123';
GRANT ALL PRIVILEGES ON DATABASE knowledgeai TO knowledgeai;
\q
```

### 2. Install Redis
**macOS:**
```bash
brew install redis
brew services start redis
```

**OR use Docker:**
```bash
docker run -d --name knowledgeai-postgres -e POSTGRES_DB=knowledgeai -e POSTGRES_USER=knowledgeai -e POSTGRES_PASSWORD=knowledgeai123 -p 5432:5432 postgres:14

docker run -d --name knowledgeai-redis -p 6379:6379 redis:7
```

## Application Setup

### Step 1: Configure Environment

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Edit .env and add your OpenAI API key:**
```bash
nano .env
# Set: OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 2: Setup Backend

```bash
# Activate virtual environment
source RPF/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
cd backend
python init_db.py
# Choose 'y' to create demo user
cd ..
```

### Step 3: Setup Frontend

```bash
cd frontend
npm install
cd ..
```

### Step 4: Start Application

**Terminal 1 - Backend:**
```bash
source RPF/bin/activate
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## Demo Login

```
Email: demo@knowledgeai.com
Password: demo123
```

## Testing the Application

### 1. Test Authentication
- Visit http://localhost:5173
- Click "Sign In"
- Use demo credentials
- You should see the Dashboard

### 2. Test File Upload
- Navigate to "Knowledge" page
- Click "Add Source"
- Upload a PDF, DOCX, or TXT file
- Status should show "Pending" (indexing not yet implemented)

### 3. Test Chat Interface
- Navigate to "Chat" page
- Type a question
- You'll see a placeholder response (RAG not yet implemented)

### 4. Test Questionnaire Upload
- Navigate to "Questionnaires" page
- Upload a CSV or XLSX file
- Status tracking interface will appear

## Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
psql -U knowledgeai -d knowledgeai
# Should connect without error

# Check if Redis is running
redis-cli ping
# Should return "PONG"
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Database errors
```bash
# Reset database
cd backend
python init_db.py
```

### Port already in use
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## What's Working vs Not Yet Implemented

### ✅ Working Now
- User registration and login
- JWT authentication
- Dashboard with stats
- File upload UI
- Source management
- Chat interface UI
- Questionnaire upload UI
- Database persistence
- API endpoints

### ⏳ Not Yet Implemented (Phase 2-5)
- **Document Indexing:** Files are uploaded but not indexed into vector store
- **RAG Pipeline:** Chat returns placeholder response, not real AI answers
- **LangChain/LlamaIndex:** Integration code needs to be written
- **Background Processing:** Celery workers not configured
- **Web Scraping:** URL sources aren't crawled
- **Questionnaire Processing:** Batch answering not implemented
- **Integrations:** Google Drive, Confluence, etc.

## Next Development Steps

To complete the application:

1. **Phase 2: Implement document ingestion**
   - Create `backend/app/services/ingestion/document_processor.py`
   - Integrate LlamaIndex for chunking
   - Set up ChromaDB
   - Create Celery tasks

2. **Phase 3: Implement RAG pipeline**
   - Create `backend/app/services/retrieval/rag_pipeline.py`
   - Integrate LangChain
   - Connect OpenAI API
   - Implement streaming responses

3. **Phase 4: Implement questionnaire automation**
   - Create `backend/app/services/llm/questionnaire_service.py`
   - Batch processing logic
   - Export functionality

4. **Phase 5: Polish and deploy**
   - Add error handling
   - Improve loading states
   - Deploy to production

## Support

For issues, check:
- Backend logs in terminal
- Browser console (F12)
- API docs at http://localhost:8000/docs

See IMPLEMENTATION_SUMMARY.md for detailed status.
