# PaperTalk

### Why does this repo exist?
I wanted to learn more about how LLMs interact with documents and handle long contexts, as well as understand embeddings and vector databases. I created this project to explore these concepts.

---
### What is PaperTalk?
PaperTalk lets you upload multiple documents (PDF, DOCX, TXT) and ask questions about them. It uses an LLM to answer your questions based on the content of the documents.

---
### How does it work?
- The user uploads documents.
- The text is extracted and split into chunks.
- Embeddings are created for each chunk and stored in a vector database.
- When a user asks a question, an embedding is created for the question and the most similar chunks are retrieved from the vector database.
- The LLM answers the question based on the retrieved chunks.
- Pretty simple, right?

---
### How can it be improved?
- Currently, only the backend is built; a frontend can be added.
- More features like summarization, keyword extraction, etc. can be included.
- All documents are currently in one place; we can add different chats or projects (like ChatGPT) so users can keep their documents and chats organized.(done)
- Simple authentication, chat storage, and other features can be added.

---
### How to run it?
- Clone the repo (`git clone https://github.com/Jainex17/PaperTalk.git`)
- Create and activate a virtual environment (`python -m venv venv && source venv/bin/activate`)
- Install the requirements (`pip install -r requirements.txt`)
- Set the environment variables (`cp .env.example .env` and fill in the values)
- Init the database by creating the tables
```
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    doc_id TEXT UNIQUE,
    space TEXT,
    text TEXT,
    embedding VECTOR(768)
);
```
- Run the app (`uvicorn main:app --reload`)

---
