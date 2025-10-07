import logging
from typing import Dict, Any, List, Tuple

from services.context_builder import ContextBuilder
from services.ai_service import AIService
from vector_store import (
    query_documents_hybrid,
    expand_query,
    classify_query,
    get_all_chunks_from_space
)
from prompts import ANALYZE_ALL_PROMPT_TEMPLATE, SPECIFIC_QUERY_PROMPT_TEMPLATE, PREV_CONTEXT_PROMPT_TEMPLATE
from constants import (
    MAX_CONTEXT_TOKENS_ANALYZE_ALL,
    MAX_CONTEXT_TOKENS_SPECIFIC,
    TOP_K_CHUNKS,
    MAX_CHUNKS_ANALYZE_ALL,
    MAX_RELEVANT_CHUNKS,
    DISTANCE_THRESHOLD,
    QUERY_TYPE_ANALYZE_ALL,
    QUERY_TYPE_PREV_CONTEXT
)

logger = logging.getLogger(__name__)


class QueryService:

    def __init__(self):
        self.context_builder = ContextBuilder()
        self.ai_service = AIService()
        self.chat_history: Dict[str, List[Tuple[str, str]]] = {}

    def process_query(self, space_id: str, query: str, is_first_message: bool = False) -> Dict[str, Any]:
        if is_first_message:
            self.chat_history[space_id] = []
            logger.info(f"Cleared chat history for space: {space_id}")

        query_type = classify_query(query)

        if query_type == QUERY_TYPE_ANALYZE_ALL:
            result = self._process_analyze_all_query(space_id, query)
        elif query_type == QUERY_TYPE_PREV_CONTEXT:
            result = self._process_prev_context_query(space_id, query)
        else:
            result = self._process_specific_query(space_id, query)

        if space_id not in self.chat_history:
            self.chat_history[space_id] = []
        self.chat_history[space_id].append((query, result["answer"]))

        if len(self.chat_history[space_id]) > 10:
            self.chat_history[space_id] = self.chat_history[space_id][-10:]

        return result

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

    def _process_prev_context_query(self, space_id: str, query: str) -> Dict[str, Any]:
        history = self.chat_history.get(space_id, [])

        if not history:
            logger.warning(f"No chat history found for space {space_id}, falling back to specific query")
            return self._process_specific_query(space_id, query)

        chat_history_text = ""
        for i, (user_msg, assistant_msg) in enumerate(history, 1):
            chat_history_text += f"User: {user_msg}\n\nAssistant: {assistant_msg}\n\n"

        prompt = PREV_CONTEXT_PROMPT_TEMPLATE.format(
            chat_history=chat_history_text.strip(),
            query=query
        )

        answer = self.ai_service.generate_response(prompt)

        if not answer:
            raise Exception("Failed to generate response")

        return {
            "answer": answer,
            "sources": [],
            "debug": {
                "context_tokens": 0,
                "chunks_used": 0,
                "chunks_available": 0
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
