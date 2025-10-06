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

        context_parts = []
        sources = []
        current_tokens = 0

        for i, chunk in enumerate(filtered_chunks, 1):
            chunk_text = chunk['text']
            chunk_context = f"[Source {i} - Document: {chunk['doc_id']}]\n{chunk_text}"

            chunk_tokens = len(self.encoder.encode(chunk_context))
            if current_tokens + chunk_tokens > max_tokens:
                break

            context_parts.append(chunk_context)
            current_tokens += chunk_tokens
            sources.append({
                "doc_id": chunk['doc_id'],
                "filename": chunk.get('filename', 'N/A'),
                "chunk_text": chunk['text'],
                "relevance_score": chunk.get('distance', 'N/A')
            })

        context = "\n\n---\n\n".join(context_parts)
        return context, sources, current_tokens
