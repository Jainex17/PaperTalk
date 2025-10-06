import logging
import os
from typing import Tuple

from pdf_utils import extract_text, chunk_text
from vector_store import upload_document
from constants import MAX_FILE_SIZE_BYTES, ALLOWED_FILE_EXTENSIONS

logger = logging.getLogger(__name__)


class DocumentService:

    def validate_file(self, filename: str, file_size: int) -> None:
        if not filename.lower().endswith(ALLOWED_FILE_EXTENSIONS):
            raise ValueError(f"Unsupported file type. Only {', '.join(ALLOWED_FILE_EXTENSIONS)} are allowed.")

        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError(f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.")

    def process_document(
        self,
        file_content: bytes,
        filename: str,
        space_id: str
    ) -> Tuple[str, int]:
        temp_file_path = f"temp_{filename}"

        try:
            with open(temp_file_path, "wb") as f:
                f.write(file_content)

            text = extract_text(temp_file_path)
            if text is None:
                raise ValueError("Failed to extract text from document")

            chunks = chunk_text(text)

            file_id = upload_document(chunks, space_id, filename)

            logger.info(f"Uploaded document {filename} with {len(chunks)} chunks to space {space_id}")

            return file_id, len(chunks)

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
