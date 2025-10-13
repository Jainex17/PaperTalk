from typing import List, Dict, Any, Tuple
import tiktoken

from constants import TIKTOKEN_ENCODING


class ContextBuilder:

    def __init__(self):
        self.encoder = tiktoken.get_encoding(TIKTOKEN_ENCODING)

    def build_context_for_analyze_all(
        self,
        chunks: List[Dict[str, Any]],
        max_tokens: int
    ) -> Tuple[str, List[Dict[str, Any]], int]:
        context_parts = []
        sources = []
        current_tokens = 0

        for i, chunk in enumerate(chunks, 1):
            chunk_text = chunk['text']
            chunk_context = f"[Document: {chunk['filename']}, Section {chunk['chunk_index']}]\n{chunk_text}"

            chunk_tokens = len(self.encoder.encode(chunk_context))
            if current_tokens + chunk_tokens > max_tokens:
                break

            context_parts.append(chunk_context)
            current_tokens += chunk_tokens
            sources.append({
                "doc_id": chunk['doc_id'],
                "filename": chunk.get('filename', 'N/A'),
                "chunk_text": chunk['text'],
                "relevance_score": "all_docs"
            })

        context = "\n\n---\n\n".join(context_parts)
        return context, sources, current_tokens

    def build_context_for_specific_query(
        self,
        chunks: List[Dict[str, Any]],
        max_tokens: int,
        distance_threshold: float
    ) -> Tuple[str, List[Dict[str, Any]], int]:
        filtered_chunks = [
            chunk for chunk in chunks
            if chunk.get('distance', 999) < distance_threshold
        ]

        # Prioritize multi-document representation
        seen_filenames = set()
        priority_chunks = []
        remaining_chunks = []
        
        # First pass: one chunk per document
        for chunk in filtered_chunks:
            filename = chunk.get('filename', 'N/A')
            if filename not in seen_filenames:
                seen_filenames.add(filename)
                priority_chunks.append(chunk)
            else:
                remaining_chunks.append(chunk)
        
        # Combine prioritized chunks first, then remaining
        ordered_chunks = priority_chunks + remaining_chunks

        context_parts = []
        sources = []
        current_tokens = 0

        # Cache document type hints by filename
        doc_type_hint_cache = {}

        for i, chunk in enumerate(ordered_chunks, 1):
            chunk_text = chunk['text']
            filename = chunk.get('filename', 'N/A')
            
            # Use cached document type hint if available
            if filename not in doc_type_hint_cache:
                doc_type_hint_cache[filename] = self._get_document_type_hint(filename)
            doc_type_hint = doc_type_hint_cache[filename]

            chunk_context = f"[Source {i} - {filename}{doc_type_hint}]\n{chunk_text}"

            chunk_tokens = len(self.encoder.encode(chunk_context))
            if current_tokens + chunk_tokens > max_tokens:
                break

            context_parts.append(chunk_context)
            current_tokens += chunk_tokens
            sources.append({
                "doc_id": chunk['doc_id'],
                "filename": filename,
                "chunk_text": chunk['text'],
                "relevance_score": chunk.get('distance', 'N/A')
            })

        context = "\n\n---\n\n".join(context_parts)
        return context, sources, current_tokens
    
    def _get_document_type_hint(self, filename: str) -> str:
        """Add document type hints to help LLM understand source types"""
        filename_lower = filename.lower()
        # Generic patterns that work for all users
        if 'resume' in filename_lower or 'cv' in filename_lower:
            return " (Resume/CV)"
        elif 'report' in filename_lower or 'analysis' in filename_lower:
            return " (Report)"
        elif 'guide' in filename_lower or 'tutorial' in filename_lower:
            return " (Guide)"
        elif 'article' in filename_lower or 'blog' in filename_lower:
            return " (Article)"
        # Just use file extension as hint for others
        elif filename_lower.endswith('.pdf'):
            return " (PDF Document)"
        elif filename_lower.endswith('.txt'):
            return " (Text Document)"
        return ""
