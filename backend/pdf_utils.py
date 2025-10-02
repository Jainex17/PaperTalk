from PyPDF2 import PdfReader
import os
import tiktoken

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

def chunk_text(text: str, chunk_tokens=400, overlap=50):
    encoder = tiktoken.get_encoding("cl100k_base")
    tokens = encoder.encode(text)
    chunks = []
    
    for i in range(0, len(tokens), chunk_tokens - overlap):
        chunk_tokens_slice = tokens[i:i + chunk_tokens]
        chunk_text = encoder.decode(chunk_tokens_slice)
        chunks.append(chunk_text)
    
    return chunks