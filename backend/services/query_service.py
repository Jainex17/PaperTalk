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
from prompts import (
    ANALYZE_ALL_PROMPT_TEMPLATE,
    SPECIFIC_QUERY_PROMPT_TEMPLATE,
    PREV_CONTEXT_PROMPT_TEMPLATE,
    CROSS_DOCUMENT_PROMPT_TEMPLATE,
    EXTRACT_SOURCE_INFO_TEMPLATE
)
from constants import (
    MAX_CONTEXT_TOKENS_ANALYZE_ALL,
    MAX_CONTEXT_TOKENS_SPECIFIC,
    MAX_CONTEXT_TOKENS_CROSS_DOCUMENT,
    TOP_K_CHUNKS,
    MAX_CHUNKS_ANALYZE_ALL,
    MAX_RELEVANT_CHUNKS,
    DISTANCE_THRESHOLD,
    QUERY_TYPE_ANALYZE_ALL,
    QUERY_TYPE_PREV_CONTEXT,
    QUERY_TYPE_CROSS_DOCUMENT
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
        elif query_type == QUERY_TYPE_CROSS_DOCUMENT:
            result = self._process_cross_document_query(space_id, query)
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

    def _process_cross_document_query(self, space_id: str, query: str) -> Dict[str, Any]:
        """
        Document-aware two-stage retrieval for cross-document queries:
        1. Retrieve initial relevant chunks using semantic search
        2. Extract key info and query target document(s)
        3. Synthesize results from multiple documents
        """

        source_chunks = query_documents_hybrid(
            query,
            top_k=10,
            space_id=space_id
        )

        if not source_chunks:
            raise ValueError("No relevant information found.")

        source_context = "\n\n".join([
            f"[{chunk['filename']}]\n{chunk['text']}"
            for chunk in source_chunks[:5]
        ])

        extract_prompt = EXTRACT_SOURCE_INFO_TEMPLATE.format(
            source_chunks=source_context,
            original_query=query
        )

        extracted_info = self.ai_service.generate_response(extract_prompt)
        logger.info(f"Extracted info from source: {extracted_info[:200]}...")

        enhanced_query = f"{extracted_info} {query}"
        target_chunks = query_documents_hybrid(
            enhanced_query,
            top_k=TOP_K_CHUNKS,
            space_id=space_id
        )

        all_chunk_ids = set()
        combined_chunks = []

        for chunk in source_chunks[:5]:
            if chunk['doc_id'] not in all_chunk_ids:
                all_chunk_ids.add(chunk['doc_id'])
                combined_chunks.append(chunk)

        for chunk in target_chunks[:5]:
            if chunk['doc_id'] not in all_chunk_ids:
                all_chunk_ids.add(chunk['doc_id'])
                combined_chunks.append(chunk)

        context, sources, current_tokens = self.context_builder.build_context_for_specific_query(
            combined_chunks,
            MAX_CONTEXT_TOKENS_CROSS_DOCUMENT,
            DISTANCE_THRESHOLD
        )

        prompt = CROSS_DOCUMENT_PROMPT_TEMPLATE.format(
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
                "chunks_available": len(combined_chunks),
                "source_chunks": len(source_chunks),
                "target_chunks": len(target_chunks)
            }
        }
