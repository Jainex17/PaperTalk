from fastapi import FastAPI, UploadFile, File
from google import genai
from pydantic import BaseModel
import os

from config.config import Settings
from pdf_utils import extract_text, chunk_text

app = FastAPI(title="PaperTalk")
settings = Settings()
client = genai.Client(api_key=settings.GEMINI_API_KEY)

@app.get("/")
def hello():
    print("Hello World")
    return {"running..."}

class AskBody(BaseModel):
    query: str

@app.post("/ask")
def ask(body: AskBody):
    res = client.models.generate_content(
        model="gemini-2.5-flash", contents=body.query
    )
    return {"res": res.text}

@app.post("/readpdf")
def read_pdf(file: UploadFile = File(...)):
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(file.file.read())

    text = extract_text(file_location)
    chunks = chunk_text(text)

    os.remove(file_location)

    return chunks