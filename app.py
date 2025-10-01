from fastapi import FastAPI, UploadFile, File, Form
from google import genai
from pydantic import BaseModel
import os

from config.config import settings
from pdf_utils import extract_text, chunk_text
from vector_store import add_document, query_documents

app = FastAPI(title="PaperTalk")
client = genai.Client(api_key=settings.GEMINI_API_KEY)

@app.get("/")
def hello():
    return "runing.."

class AskBody(BaseModel):
    space: str
    query: str

@app.post("/ask")
def ask(body: AskBody):
    try:
        relevant_chunks = query_documents(body.query, top_k=3, space=body.space)

        if not relevant_chunks:
            return {"answer": "No relevant information found.", "sources": []}

        context_parts = []
        sources = []

        for i, chunk in enumerate(relevant_chunks, 1):
            context_parts.append(
                f"[Source {i} - Document: {chunk['doc_id']}]\n{chunk['text']}"
            )
            sources.append({
                "doc_id": chunk['doc_id'],
                "relevance_score": chunk.get('score', 'N/A')
            })

        context = "\n\n---\n\n".join(context_parts)
        prompt = f"""Answer the question based on the following context. If the answer isn't in the context, say so. Context: {context} Question: {body.query} Answer:"""

        res = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt,
            config={
                "temperature": 0.2,
                "max_output_tokens": 1024,
            }
        )
        if not res or not res.text:
            return {"error": "Failed to generate response", "sources": sources}

        return {
            "answer": res.text, 
            "sources": sources
        }
    except Exception as e:
        print(f"Error in /ask endpoint: {str(e)}")
        return {"error": "An error occurred processing your request"}, 500
    
@app.post("/uploadpdf")
def read_pdf(space: str = Form(...), file: UploadFile = File(...)):
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(file.file.read())

    text = extract_text(file_location)
    if text is None:
        return {"error": "Failed to extract text from PDF"}

    chunks = chunk_text(text)
    file_id = add_document(chunks, space, file.filename)

    os.remove(file_location)
    return {"fileid": file_id, "chunk_count": len(chunks)}

@app.post("/search")
def search(body: AskBody):
    result = query_documents(body.query, 3, body.space)

    return result