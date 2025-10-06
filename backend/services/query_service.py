import logging
from typing import Dict, Any

from services.context_builder import ContextBuilder
from services.ai_service import AIService
from vector_store import (
    query_documents_hybrid,
    expand_query,
    classify_query,
    get_all_chunks_from_space
)
from prompts import ANALYZE_ALL_PROMPT_TEMPLATE, SPECIFIC_QUERY_PROMPT_TEMPLATE
from constants import (
    MAX_CONTEXT_TOKENS_ANALYZE_ALL,
    MAX_CONTEXT_TOKENS_SPECIFIC,
    TOP_K_CHUNKS,
    MAX_CHUNKS_ANALYZE_ALL,
    MAX_RELEVANT_CHUNKS,
    DISTANCE_THRESHOLD,
    QUERY_TYPE_ANALYZE_ALL
)

logger = logging.getLogger(__name__)


class QueryService:

    def __init__(self):
        self.context_builder = ContextBuilder()
        self.ai_service = AIService()

    def process_query(self, space_id: str, query: str) -> Dict[str, Any]:
        query_type = classify_query(query)

        if query_type == QUERY_TYPE_ANALYZE_ALL:
            return self._process_analyze_all_query(space_id, query)
        else:
            return self._process_specific_query(space_id, query)

    def _process_analyze_all_query(self, space_id: str, query: str) -> Dict[str, Any]:
        relevant_chunks = get_all_chunks_from_space(
            space_id,
            max_chunks=MAX_CHUNKS_ANALYZE_ALL
        )

        if not relevant_chunks:
            raise ValueError("No documents found in this space.")

        context, sources, current_tokens = self.context_builder.build_context_for_analyze_all(
            relevant_chunks,
            MAX_CONTEXT_TOKENS_ANALYZE_ALL
        )

        prompt = ANALYZE_ALL_PROMPT_TEMPLATE.format(
            context=context,
            query=query
        )

        answer = self.ai_service.generate_response(prompt)

        if not answer:
            raise Exception("Failed to generate response")

        return {
            "answer": answer,
            "sources": sources,
            "debug": {
                "context_tokens": current_tokens,
                "chunks_used": len(sources),
                "chunks_available": len(relevant_chunks)
            }
        }

    def _process_specific_query(self, space_id: str, query: str) -> Dict[str, Any]:
        expanded_query = expand_query(query)
        relevant_chunks = query_documents_hybrid(
            expanded_query,
            top_k=TOP_K_CHUNKS,
            space_id=space_id
        )

        if not relevant_chunks:
            raise ValueError("No relevant information found.")

        relevant_chunks = relevant_chunks[:MAX_RELEVANT_CHUNKS]

        context, sources, current_tokens = self.context_builder.build_context_for_specific_query(
            relevant_chunks,
            MAX_CONTEXT_TOKENS_SPECIFIC,
            DISTANCE_THRESHOLD
        )

        logger.info(f"Context: {context}")

        prompt = SPECIFIC_QUERY_PROMPT_TEMPLATE.format(
            context=context,
            query=query
        )

        answer = self.ai_service.generate_response(prompt)

        if not answer:
            raise Exception("Failed to generate response")

        return {
            "answer": answer,
            "sources": sources,
            "debug": {
                "context_tokens": current_tokens,
                "chunks_used": len(sources),
                "chunks_available": len(relevant_chunks)
            }
        }
