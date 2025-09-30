from PyPDF2 import PdfReader
import os

def extract_text(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    elif ext == ".pdf":
        reader = PdfReader(file_path)
        text = ""
    
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text += page_text + "\n"

        return text
    else:
        raise ValueError("Unsupported file type. Only .pdf and .txt are allowed.")

def chunk_text(text: str, chunk_size=500):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunks.append(" ".join(words[i:i+chunk_size]))
    
    return chunks