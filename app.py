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
    relevant_chunks = query_documents(body.query, 3, body.space)
    context = "\n".join(relevant_chunks)

    prompt = f"Answer the question based on the context below:\n\nContext: {context}\n\nQuestion: {body.query}\nAnswer:"

    res = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )

    return {"res": res.text}

@app.post("/uploadpdf")
def read_pdf(space: str = Form(...), file: UploadFile = File(...)):
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(file.file.read())

    text = extract_text(file_location)
    if text is None:
        return {"error": "Failed to extract text from PDF"}

    chunks = chunk_text(text)
    add_document(chunks, space)

    os.remove(file_location)
    return chunks

@app.post("/search")
def search(body: AskBody):
    result = query_documents(body.query, 3, body.space)

    return result