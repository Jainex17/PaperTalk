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
        max_context_length = 4000

        current_length = 0
        for i, chunk in enumerate(relevant_chunks, 1):
            chunk_text = chunk['text']
            if len(chunk_text) > 1500:
                chunk_text = chunk_text[:1500] + "..."
            
            chunk_context = f"[Source {i} - Document: {chunk['doc_id']}]\n{chunk_text}"
            if current_length + len(chunk_context) > max_context_length:
                break
            
            context_parts.append(chunk_context)
            current_length += len(chunk_context)
            sources.append({
                "doc_id": chunk['doc_id'],
                "relevance_score": chunk.get('distance', 'N/A')
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
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        return {"error": "Unsupported file type"}, 400
    
    if file.size > 10 * 1024 * 1024:
        return {"error": "File too large"}, 400
    
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
    try:
        results = query_documents(body.query, 3, body.space)
        if not results:
            return {
                "query": body.query,
                "results": [],
                "count": 0,
                "message": "No relevant documents found"
            }

        return {
                "query": body.query,
                "results": results,
                "count": len(results),
                "space": body.space
        }
    except Exception as e:
        return {"error": str(e)}, 500