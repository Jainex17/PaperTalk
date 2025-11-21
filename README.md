# PaperTalk

Ask questions about your PDFs. Get answers with sources.

## Demo
https://github.com/user-attachments/assets/432e0a66-9c9b-424d-aeaf-b980f5cdc5be

## What it is

PaperTalk lets you upload PDFs/TXT into personal Spaces and chat with them. Under the hood it uses retrieval-augmented generation (semantic search + an LLM) so answers stay grounded in your documents, with citations.

## What you can do

- Upload PDFs or text to a Space
- Ask natural-language questions and get cited answers
- Compare info across multiple docs in one go
- Sign in with Google; your data stays in your account

## How it works (quickly)

1. We split documents into chunks and index them with pgvector.
2. Your question retrieves the most relevant chunks.
3. Gemini generates a concise answer, citing the sources it used.

## Quick start

Prereqs: Python 3.11+, Node 18+, PostgreSQL (with pgvector), Google OAuth creds, Gemini API key.

- Create env files: backend `.env`, frontend `.env.local` (DB URL, OAuth, JWT, Gemini key, etc.).

Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tech

FastAPI + PostgreSQL/pgvector, Next.js + React + Tailwind, Sentence-Transformers for embeddings, Gemini for generation.

## Notes

- Currently supports PDF/TXT (up to ~5MB, ~25 pages). Text-only; scanned PDFs need OCR first.
- Best results in English.
