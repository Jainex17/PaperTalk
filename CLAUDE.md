# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PaperTalk is a document Q&A system that uses RAG (Retrieval-Augmented Generation) to analyze uploaded PDFs. The application consists of:
- **Backend**: FastAPI server with PostgreSQL + pgvector for vector similarity search
- **Frontend**: Next.js 15 application with TypeScript and Tailwind CSS
- **Authentication**: Google OAuth 2.0 with JWT session management

## Architecture

### Backend Service Layer
The backend follows a service-oriented architecture with clear separation of concerns:

- **[app.py](backend/app.py)** - FastAPI application entry point with CORS, session middleware, and rate limiting
- **Services** ([backend/services/](backend/services/)):
  - `query_service.py` - Orchestrates the query flow, classifies queries into 4 types, maintains chat history per space
  - `document_service.py` - Handles file validation, text extraction, and chunking
  - `context_builder.py` - Builds context from retrieved chunks while respecting token limits
  - `ai_service.py` - Wraps LLM API calls (Google Gemini)
  - `auth_service.py` - Handles Google OAuth token exchange and user info retrieval

### Vector Search & RAG Pipeline
- **[vector_store.py](backend/vector_store.py)** - Core RAG logic:
  - Uses `sentence-transformers` (all-mpnet-base-v2) for embeddings (768 dimensions)
  - Implements hybrid search: semantic similarity + keyword boosting
  - Query classification using Gemini to determine retrieval strategy
  - Four query modes: "specific", "analyze_all", "prev_context", and "cross_document"

### Database Layer
- **[db_utils.py](backend/db_utils.py)** - SQLAlchemy models and session management:
  - `Users` table - User accounts from Google OAuth (id, email, name, picture)
  - `Spaces` table - Document collections/workspaces owned by users
  - `Documents` table - Text chunks with 768-dimensional embeddings (pgvector)
  - Uses context manager pattern for session lifecycle
  - Connection pooling configured with 10 base connections, 20 max overflow

### Authentication & Security
- **[routers/auth.py](backend/routers/auth.py)** - Google OAuth endpoints (`/auth/google/login`, `/auth/google/callback`)
- **[auth_utils.py](backend/auth_utils.py)** - JWT token validation and user dependency injection
- Rate limiting via `slowapi`: 30/min for queries, 10/min for uploads, 60/min for reads
- All endpoints require authentication via `Depends(get_current_user)`

### Frontend Structure
- **App Router** - Next.js 15 with app directory structure
- **[components/](frontend/components/)** - React components organized by feature:
  - `ChatInterface.tsx` - Main chat UI
  - `SpacesList.tsx` - Space management sidebar
  - Feature-specific subdirectories (chat/, documents/, space/, ui/)
- **State Management** - Context API ([frontend/context/](frontend/context/)):
  - `AuthContext.tsx` - User authentication state
  - `SpaceContext.tsx` - Current space selection

## Development Commands

### Backend
```bash
# Create/activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run development server from backend directory
cd backend
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Start dev server with Turbopack
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Configuration

Backend requires `.env` file in `backend/` directory (see `.env.example`):
- `GEMINI_API_KEY` - Google Gemini API key for LLM responses
- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/papertalk`)
- `FRONTEND_URL` - Frontend URL for CORS (e.g., `http://localhost:3000`)
- `BACKEND_URL` - Backend URL (e.g., `http://localhost:8000`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `JWT_SECRET_KEY` - Secret key for JWT signing (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)

## Database Setup

PostgreSQL with pgvector extension required. Initialize with:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Tables are auto-created by SQLAlchemy (see db_utils.py)
-- Schema:
-- - users (id, email, name, picture, created_at)
-- - spaces (id, user_id, name, created_at)
-- - documents (id, doc_id, original_file_id, chunk_index, space_id, text, embedding, created_at)
```

Tables are automatically created via `Base.metadata.create_all(engine)` in [db_utils.py](backend/db_utils.py:68).

## Key Constants & Configuration

**[backend/constants.py](backend/constants.py)** defines critical RAG parameters:
- Token limits: `MAX_CONTEXT_TOKENS_ANALYZE_ALL` (3500), `MAX_CONTEXT_TOKENS_SPECIFIC` (2500), `MAX_CONTEXT_TOKENS_CROSS_DOCUMENT` (4000)
- Chunking: `CHUNK_TOKENS` (500), `CHUNK_OVERLAP` (100)
- Retrieval: `TOP_K_CHUNKS` (10), `MAX_CHUNKS_ANALYZE_ALL` (30), `MAX_RELEVANT_CHUNKS` (5), `DISTANCE_THRESHOLD` (1.0)
- File limits: `MAX_FILE_SIZE_MB` (5), `MAX_PDF_PAGES` (25), `ALLOWED_FILE_EXTENSIONS` (PDF, TXT)
- Model: `GEMINI_MODEL` (gemini-2.0-flash), `TEMPERATURE` (0.4)

## Query Classification Logic

The system classifies each query into one of four types (see [vector_store.py:classify_query()](backend/vector_store.py#L175)):

1. **"specific"** - Targeted questions that need semantic search (uses hybrid retrieval with top-k chunks)
2. **"analyze_all"** - Broad questions requiring analysis across all documents in a space
3. **"prev_context"** - User is referring to previous response (e.g., "summarize this", "make it shorter")
4. **"cross_document"** - User wants to connect/apply information from one document to another (uses two-stage retrieval)

Classification happens using Gemini with a zero-shot prompt template.

## Chat History Management

- Chat history is maintained per space in [query_service.py](backend/services/query_service.py:40)
- History stores last 10 message pairs (query, response)
- History is cleared when `is_first_message=true` is passed to `/ask` endpoint
- Used for "prev_context" queries to provide conversational context

## Prompt Templates

Prompt templates are defined in [backend/prompts.py](backend/prompts.py):
- `ANALYZE_ALL_PROMPT_TEMPLATE` - For comprehensive document analysis
- `SPECIFIC_QUERY_PROMPT_TEMPLATE` - For targeted question answering with source citations
- `PREV_CONTEXT_PROMPT_TEMPLATE` - For follow-up queries based on chat history
- `CROSS_DOCUMENT_PROMPT_TEMPLATE` - For cross-document analysis with source citations
- `CLASSIFICATION_PROMPT_TEMPLATE` - For query type classification
- `EXTRACT_SOURCE_INFO_TEMPLATE` - For extracting key info in cross-document queries
