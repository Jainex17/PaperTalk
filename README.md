# PaperTalk - Intelligent Document Q&A System

## Overview

PaperTalk is a document question-answering application that allows users to upload PDF documents and have intelligent conversations about their content. The system uses Retrieval-Augmented Generation (RAG) to provide accurate, context-aware answers by combining semantic search with large language models.

## What PaperTalk Does

### Core Functionality

**Document Management**
- Upload PDF and TXT files to organized workspaces called "Spaces"
- Each Space acts as a separate document collection with its own chat context
- Automatic text extraction and intelligent chunking of document content
- Support for both file uploads and direct text content input

**Intelligent Question Answering**
- Ask questions about uploaded documents in natural language
- Receive answers backed by actual content from your documents
- Get source citations showing exactly where information came from
- Maintain conversation history within each Space for contextual follow-ups

**Multi-Document Analysis**
- Compare information across multiple documents
- Analyze patterns and themes across your entire document collection
- Ask broad analytical questions that require understanding multiple sources

**User Authentication**
- Secure Google OAuth 2.0 login
- Personal workspaces isolated per user
- Session management with JWT tokens

## What PaperTalk Can Do

### Query Types

The system intelligently classifies and handles four distinct types of queries:

**1. Specific Questions**
- Direct questions about particular topics or facts
- Example: "What is the methodology described in the research paper?"
- Uses semantic search to find the most relevant chunks
- Provides citations with page numbers and filenames

**2. Comprehensive Analysis**
- Broad questions requiring analysis across all documents
- Example: "Summarize all the key findings from these papers"
- Retrieves and analyzes content from all documents in the Space
- Synthesizes information across multiple sources

**3. Conversational Follow-ups**
- Questions referring to previous responses
- Example: "Can you make that shorter?" or "Explain this in simpler terms"
- Uses chat history to understand context
- Maintains conversational flow

**4. Cross-Document Queries**
- Questions that connect or compare multiple documents
- Example: "How do the conclusions in Paper A relate to the methodology in Paper B?"
- Two-stage retrieval process for comprehensive analysis
- Provides citations from all relevant sources

### Features

**Smart Search**
- Hybrid search combining semantic similarity and keyword matching
- 768-dimensional vector embeddings using sentence transformers
- Configurable relevance thresholds to filter low-quality matches
- Distance-based ranking for optimal result ordering

**Context Management**
- Dynamic context building based on token limits
- Automatic truncation of large chunks to fit context windows
- Different token budgets for different query types
- Preserves most relevant information when context exceeds limits

**File Processing**
- Automatic text extraction from PDFs
- Intelligent chunking with overlapping sections for continuity
- Metadata preservation (page numbers, filenames, chunk positions)
- Support for documents up to 25 pages

**Rate Limiting**
- 30 requests per minute for queries
- 10 requests per minute for uploads
- 60 requests per minute for read operations
- Protects backend resources and ensures fair usage

## What PaperTalk Cannot Do

### Current Limitations

**File Restrictions**
- Only accepts PDF and TXT files (no Word, Excel, PowerPoint, etc.)
- Maximum file size of 5MB per document
- Maximum of 25 pages per PDF
- No image or table extraction from PDFs (text-only)

**Processing Constraints**
- Cannot process scanned PDFs without OCR (text must be selectable)
- Does not understand images, charts, or diagrams within documents
- Cannot handle mathematical equations or special formatting
- No support for non-text content like audio or video

**Analysis Limitations**
- Cannot access information beyond what's in uploaded documents
- Does not have internet access or external knowledge during queries
- Limited by context window sizes (max 4000 tokens for cross-document queries)
- Cannot process real-time or streaming data

**Functional Boundaries**
- No document editing or modification capabilities
- Cannot merge or split documents
- No collaborative features (sharing Spaces with other users)
- Cannot export annotated or highlighted documents
- No batch processing of multiple files simultaneously

**Language Support**
- Optimized for English language documents
- May have reduced accuracy with other languages
- No automatic translation capabilities

## How It Works

### Architecture Overview

PaperTalk uses a three-tier architecture:

**Frontend Layer**
- Modern web interface built with Next.js 15
- React components for interactive UI elements
- Real-time updates using React hooks and context
- Responsive design with Tailwind CSS

**Backend Layer**
- FastAPI server handling all business logic
- Service-oriented architecture with separated concerns
- RESTful API endpoints for all operations
- PostgreSQL database with vector search capabilities

**AI Layer**
- Google Gemini for natural language understanding and generation
- Sentence transformers for semantic embeddings
- Custom prompts optimized for different query types

### The RAG Pipeline

**Step 1: Document Upload**
- User uploads a PDF or text file to a Space
- Backend validates file type, size, and page count
- Text is extracted and split into manageable chunks (500 tokens each with 100 token overlap)
- Each chunk is converted into a 768-dimensional vector embedding
- Chunks and embeddings are stored in PostgreSQL with pgvector

**Step 2: Query Processing**
- User asks a question in natural language
- System classifies query type using Gemini LLM
- Based on classification, appropriate retrieval strategy is selected

**Step 3: Context Retrieval**
- For specific queries: Semantic search finds top 10 most relevant chunks
- For analyze-all queries: Retrieves up to 30 chunks across all documents
- For cross-document queries: Two-stage retrieval to gather comprehensive context
- For conversational queries: Uses chat history instead of document search

**Step 4: Context Building**
- Retrieved chunks are ranked by relevance (cosine distance)
- Chunks below similarity threshold are filtered out
- Context is assembled within token limits for the query type
- Source metadata (page numbers, filenames) is preserved

**Step 5: Response Generation**
- Context and query are formatted using specialized prompt templates
- Gemini LLM generates a response grounded in the retrieved context
- Response includes citations when applicable
- Answer is returned to user with source references

**Step 6: History Management**
- Query and response are stored in chat history (last 10 exchanges per Space)
- History enables contextual follow-up questions
- History is cleared when starting a new conversation in a Space

### Database Schema

**Users Table**
- Stores user profiles from Google OAuth
- Fields: ID, email, name, profile picture, creation timestamp

**Spaces Table**
- Represents document collections owned by users
- Fields: ID, user ID, space name, creation timestamp
- Each user can have multiple Spaces

**Documents Table**
- Stores text chunks with vector embeddings
- Fields: ID, document ID, original file ID, chunk index, space ID, text content, embedding vector (768 dimensions), creation timestamp
- Uses pgvector extension for efficient similarity search

### Authentication Flow

**Login Process**
- User clicks "Sign in with Google"
- Frontend redirects to Google OAuth consent screen
- User authorizes application
- Google redirects back with authorization code
- Backend exchanges code for user profile information
- JWT token is generated and returned to frontend
- Token is stored in localStorage and used for subsequent requests

**Session Management**
- JWT tokens include user ID and expiration time
- Tokens are validated on every protected endpoint request
- Invalid or expired tokens result in 401 Unauthorized responses
- Users must re-authenticate when tokens expire

## Why These Design Decisions

### Why RAG Instead of Fine-tuning

**Dynamic Content**
- Documents can be added/removed without retraining
- Immediate availability of new information
- Cost-effective for frequently changing content

**Transparency**
- Provides source citations for every answer
- Users can verify information against original documents
- Reduces hallucination by grounding responses in actual content

**Resource Efficiency**
- No expensive model training required
- Scales with document volume, not model size
- Lower computational requirements

### Why Chunk-Based Retrieval

**Context Window Management**
- LLMs have limited context windows
- Chunking allows processing of documents larger than context limits
- Overlapping chunks ensure important information isn't lost at boundaries

**Precision**
- Smaller chunks enable more precise retrieval
- Better matching between query and relevant content
- Reduces noise from irrelevant sections

**Performance**
- Faster vector search on smaller embeddings
- More efficient storage and retrieval
- Better scalability

### Why Four Query Types

**Optimized Retrieval**
- Different questions require different search strategies
- Specific queries need precision; broad queries need coverage
- Conversational queries need history; cross-document queries need multiple sources

**Resource Management**
- Different token budgets prevent context overflow
- Specific queries use less context than analytical queries
- Efficient use of API calls and processing power

**User Experience**
- Faster responses for simple questions
- More comprehensive answers for complex analysis
- Natural conversation flow for follow-ups

### Why PostgreSQL + pgvector

**Single Database**
- Eliminates need for separate vector database
- Simplified architecture and deployment
- Easier transaction management across relational and vector data

**ACID Compliance**
- Ensures data consistency
- Reliable user and space management
- Safe concurrent operations

**Performance**
- Fast similarity search with pgvector indexing
- Efficient joins between users, spaces, and documents
- Mature optimization and query planning

### Why Google Gemini

**Cost Efficiency**
- Competitive pricing for high-quality responses
- Flash model provides fast inference
- Lower operational costs than other providers

**Quality**
- Strong performance on question-answering tasks
- Good at following complex prompt instructions
- Handles various query types effectively

**Integration**
- Simple API with good documentation
- Reliable uptime and performance
- Easy to switch models if needed

### Why Service-Oriented Architecture

**Separation of Concerns**
- Each service has a single, well-defined responsibility
- Easier to understand and maintain
- Changes to one service don't affect others

**Testability**
- Services can be tested in isolation
- Mock dependencies for unit testing
- Clear interfaces and contracts

**Scalability**
- Individual services can be optimized independently
- Easier to identify bottlenecks
- Potential for microservices migration if needed

## Tech Stack

### Frontend

**Framework & Core**
- Next.js 15 - React framework with App Router for modern web applications
- React 19 - UI library for component-based interfaces
- TypeScript - Type-safe JavaScript for better developer experience

**Styling**
- Tailwind CSS - Utility-first CSS framework for rapid UI development
- CSS Modules - Scoped styling for component isolation

**State Management**
- React Context API - Global state for authentication and space selection
- React Hooks - Local state management and side effects

**HTTP Client**
- Fetch API - Native browser API for HTTP requests
- Custom API wrapper functions for type-safe backend communication

**Build Tools**
- Turbopack - Next-generation bundler for fast development and builds
- ESLint - Code quality and consistency checking

### Backend

**Framework & Server**
- FastAPI - Modern Python web framework with automatic API documentation
- Uvicorn - ASGI server for high-performance async request handling

**Database & ORM**
- PostgreSQL - Relational database for structured data
- pgvector - PostgreSQL extension for vector similarity search
- SQLAlchemy - Python SQL toolkit and ORM for database operations

**AI & Machine Learning**
- Google Gemini API - Large language model for text generation and classification
- Sentence Transformers - Library for generating text embeddings
- all-mpnet-base-v2 - Pre-trained model for semantic embeddings (768 dimensions)

**Document Processing**
- PyPDF2 - PDF text extraction library
- tiktoken - Token counting for context management

**Authentication & Security**
- Google OAuth 2.0 - Secure user authentication
- JWT (JSON Web Tokens) - Stateless session management
- python-jose - JWT encoding and decoding
- passlib - Password hashing utilities

**API & Middleware**
- CORS Middleware - Cross-origin resource sharing for frontend-backend communication
- Starlette Sessions - Session management middleware
- SlowAPI - Rate limiting to prevent abuse

**Development Tools**
- python-dotenv - Environment variable management
- Pydantic - Data validation and settings management

### Infrastructure & Deployment

**Development Environment**
- Python 3.11+ - Backend runtime
- Node.js 18+ - Frontend runtime
- npm - Package management for frontend dependencies
- pip - Package management for Python dependencies

**Database**
- PostgreSQL 14+ - With pgvector extension enabled

**Version Control**
- Git - Source code management

### External Services

**APIs & Cloud Services**
- Google OAuth 2.0 - User authentication provider
- Google Gemini API - AI/LLM service provider

## Project Structure

### Backend Organization

**Application Entry**
- app.py - FastAPI application setup, middleware, CORS, and route registration

**Services Layer**
- query_service.py - Orchestrates question-answering flow
- document_service.py - Handles file upload and processing
- context_builder.py - Assembles retrieval context within token limits
- ai_service.py - Wraps LLM API calls
- auth_service.py - Google OAuth integration

**Core Modules**
- vector_store.py - Vector search and RAG pipeline
- db_utils.py - Database models and session management
- auth_utils.py - JWT validation and user authentication
- constants.py - Configuration constants and parameters
- prompts.py - LLM prompt templates

**Routing**
- routers/auth.py - Authentication endpoints
- routers/spaces.py - Space management endpoints
- routers/documents.py - Document upload and retrieval endpoints
- routers/query.py - Question-answering endpoints

### Frontend Organization

**Pages**
- app/page.tsx - Landing page with project introduction
- app/spaces/[id]/page.tsx - Individual space interface with chat

**Components**
- ChatInterface.tsx - Main chat UI with message history
- SpacesList.tsx - Sidebar for space navigation and creation
- Navbar.tsx - Top navigation with authentication controls
- DocumentsModal.tsx - Document upload and management interface
- SpaceCard.tsx - Individual space preview card
- MessageBubble.tsx - Chat message display with citations

**Context Providers**
- AuthContext.tsx - User authentication state
- SpaceContext.tsx - Current space selection state

**Utilities**
- lib/api/ - API client functions for backend communication
- lib/utils.ts - Helper functions and utilities
- lib/config.ts - Frontend configuration constants

**Hooks**
- useDocuments.ts - Document management state and operations
- Custom hooks for API data fetching and state management

## Configuration Parameters

### RAG Parameters

**Token Limits**
- Max context tokens for analyze-all queries: 3500
- Max context tokens for specific queries: 2500
- Max context tokens for cross-document queries: 4000

**Chunking Configuration**
- Chunk size: 500 tokens
- Chunk overlap: 100 tokens

**Retrieval Settings**
- Top K chunks per query: 10
- Max chunks for analyze-all: 30
- Max relevant chunks for specific: 5
- Similarity distance threshold: 1.0

**File Processing Limits**
- Maximum file size: 5MB
- Maximum PDF pages: 25
- Allowed extensions: PDF, TXT

**Model Configuration**
- LLM model: gemini-2.0-flash
- Temperature: 0.4 (balanced between creativity and consistency)

### Rate Limiting

**Query Endpoints**
- 30 requests per minute

**Upload Endpoints**
- 10 requests per minute

**Read Endpoints**
- 60 requests per minute

### Database Configuration

**Connection Pooling**
- Base pool size: 10 connections
- Max overflow: 20 additional connections
- Pool recycle: 3600 seconds (1 hour)

## Future Enhancements

While not currently implemented, potential improvements could include:

- Support for more file formats (DOCX, PPTX, Excel)
- OCR for scanned PDFs
- Table and image extraction
- Multi-language support
- Collaborative spaces with sharing
- Document annotations and highlights
- Export functionality for conversations
- Advanced analytics and insights
- Mobile application
- Batch document processing
- Custom embedding models
- Webhook integrations
- API access for third-party applications

## Getting Started

### Prerequisites

- PostgreSQL 14+ with pgvector extension
- Python 3.11+
- Node.js 18+
- Google Cloud project with OAuth 2.0 credentials
- Google Gemini API key

### Environment Setup

Create environment files with required configuration:
- Backend: .env file in backend directory
- Frontend: .env.local file in frontend directory

Required environment variables include database URLs, API keys, OAuth credentials, and JWT secrets.

### Installation

Install backend dependencies using pip and frontend dependencies using npm. Start PostgreSQL and ensure pgvector extension is enabled. Run database migrations if needed (tables auto-create on first run).

### Running the Application

Start backend server from backend directory on port 8000. Start frontend development server from frontend directory on port 3000. Access application at localhost:3000.

## Security Considerations

**Authentication**
- All API endpoints require valid JWT tokens
- Tokens expire and require re-authentication
- Google OAuth provides secure user verification

**Data Isolation**
- Users can only access their own Spaces and documents
- Database queries filter by authenticated user ID
- No cross-user data leakage

**Rate Limiting**
- Prevents abuse and DoS attacks
- Protects backend resources
- Ensures fair usage across users

**Input Validation**
- File type and size validation
- SQL injection prevention through ORM
- XSS protection through React's built-in escaping

**Secrets Management**
- Sensitive keys stored in environment variables
- No hardcoded credentials in source code
- JWT secret keys use cryptographically secure random generation

## Performance Characteristics

**Query Response Time**
- Specific queries: 2-5 seconds
- Analyze-all queries: 5-10 seconds
- Cross-document queries: 5-12 seconds
- Follow-up queries: 1-3 seconds

**Upload Processing Time**
- Small PDFs (1-5 pages): 5-15 seconds
- Medium PDFs (6-15 pages): 15-30 seconds
- Large PDFs (16-25 pages): 30-60 seconds

**Scalability**
- Database connection pooling supports concurrent users
- Vector search performance degrades logarithmically with document count
- Stateless backend enables horizontal scaling

## Support and Resources

For issues, questions, or contributions, refer to the project repository. The system is designed for personal document analysis and research workflows, optimized for accuracy and source transparency.
