import logging
import os
from typing import List, Optional

from PyPDF2 import PdfReader
import tiktoken

from constants import CHUNK_TOKENS, CHUNK_OVERLAP, TIKTOKEN_ENCODING

logger = logging.getLogger(__name__)


def extract_text(file_path: str) -> Optional[str]:
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".txt":
            return _extract_from_txt(file_path)
        elif ext == ".pdf":
            return _extract_from_pdf(file_path)
        else:
            raise ValueError("Unsupported file type. Only .pdf and .txt are allowed.")

    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {str(e)}", exc_info=True)
        return None


def _extract_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def _extract_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text_parts = []

    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text and page_text.strip():
            text_parts.append(page_text)

    return "\n".join(text_parts)


def chunk_text(
    text: str,
    chunk_tokens: int = CHUNK_TOKENS,
    overlap: int = CHUNK_OVERLAP
) -> List[str]:
    encoder = tiktoken.get_encoding(TIKTOKEN_ENCODING)
    tokens = encoder.encode(text)
    chunks = []

    step_size = chunk_tokens - overlap

    for i in range(0, len(tokens), step_size):
        chunk_token_slice = tokens[i:i + chunk_tokens]
        chunk_text = encoder.decode(chunk_token_slice)
        chunks.append(chunk_text)

    logger.info(f"Split text into {len(chunks)} chunks")
    return chunks
