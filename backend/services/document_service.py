import logging
import os
import re
from typing import Tuple, Optional

from pdf_utils import extract_text, chunk_text
from vector_store import upload_document
from constants import MAX_FILE_SIZE_BYTES, ALLOWED_FILE_EXTENSIONS, MAX_TEXT_CHARACTERS

logger = logging.getLogger(__name__)


class DocumentService:

    def validate_file(self, filename: str, file_size: int) -> None:
        if not filename.lower().endswith(ALLOWED_FILE_EXTENSIONS):
            raise ValueError(f"Unsupported file type. Only {', '.join(ALLOWED_FILE_EXTENSIONS)} are allowed.")

        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError(f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.")

    def _generate_filename_from_text(self, text: str) -> str:
        """Generate a filename from the first few words of text content."""
        # Remove extra whitespace and newlines
        cleaned_text = re.sub(r'\s+', ' ', text.strip())

        # Take first 50 characters
        filename_base = cleaned_text[:50]

        # Remove special characters that aren't allowed in filenames
        filename_base = re.sub(r'[^\w\s-]', '', filename_base)

        # Replace spaces with underscores
        filename_base = filename_base.replace(' ', '_')

        # Ensure filename is not empty
        if not filename_base:
            filename_base = "pasted_text"

        return f"{filename_base}.txt"

    def process_text_content(
        self,
        text_content: str,
        space_id: str,
        user_id: str
    ) -> Tuple[str, int, str]:
        """Process pasted text content as a document."""
        if not text_content or not text_content.strip():
            raise ValueError("Text content cannot be empty")

        if len(text_content) > MAX_TEXT_CHARACTERS:
            raise ValueError(f"Text content exceeds maximum length of {MAX_TEXT_CHARACTERS:,} characters")

        # Generate filename from first few words
        filename = self._generate_filename_from_text(text_content)

        # Chunk the text
        chunks = chunk_text(text_content)

        # Upload to vector store
        file_id = upload_document(chunks, space_id, user_id, filename)

        logger.info(f"Uploaded text content as '{filename}' with {len(chunks)} chunks to space {space_id}")

        return file_id, len(chunks), filename

    def process_document(
        self,
        file_content: bytes,
        filename: str,
        space_id: str,
        user_id: str
    ) -> Tuple[str, int]:
        temp_file_path = f"temp_{filename}"

        try:
            with open(temp_file_path, "wb") as f:
                f.write(file_content)

            text = extract_text(temp_file_path)
            if text is None:
                raise ValueError("Failed to extract text from document")

            chunks = chunk_text(text)

            file_id = upload_document(chunks, space_id, user_id, filename)

            logger.info(f"Uploaded document {filename} with {len(chunks)} chunks to space {space_id}")

            return file_id, len(chunks)

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
