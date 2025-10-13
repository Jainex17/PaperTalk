import logging
import re
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
    COMMON_WORDS = {
        'The', 'This', 'That', 'What', 'Where', 'When', 'How', 'Why',
        'Based', 'According', 'Source', 'Does', 'Should', 'Can', 'Will'
    }

    def __init__(self):
        self.context_builder = ContextBuilder()
        self.ai_service = AIService()
        self.chat_history: Dict[str, List[Tuple[str, str]]] = {}

    def process_query(self, space_id: str, query: str, is_first_message: bool = False, user_id: str = None) -> Dict[str, Any]:
        if is_first_message:
            self.chat_history[space_id] = []
            logger.info(f"Cleared chat history for space: {space_id}")

        query_type = classify_query(query)

        if query_type == QUERY_TYPE_ANALYZE_ALL:
            result = self._process_analyze_all_query(space_id, query, user_id)
        elif query_type == QUERY_TYPE_PREV_CONTEXT:
            result = self._process_prev_context_query(space_id, query, user_id)
        elif query_type == QUERY_TYPE_CROSS_DOCUMENT:
            result = self._process_cross_document_query(space_id, query, user_id)
        else:
            result = self._process_specific_query(space_id, query, user_id)

        if space_id not in self.chat_history:
            self.chat_history[space_id] = []
        self.chat_history[space_id].append((query, result["answer"]))

        if len(self.chat_history[space_id]) > 10:
            self.chat_history[space_id] = self.chat_history[space_id][-10:]

        return result
    
    def _enhance_query_with_context(self, space_id: str, query: str) -> str:
        """Enhance query by providing entities as a context note, not altering original query semantics"""
        if space_id not in self.chat_history or not self.chat_history[space_id]:
            return query

        # Extract entities mentioned in recent chat history
        recent_history = self.chat_history[space_id][-3:]  # Last 3 exchanges
        entities = set()

        for prev_query, prev_answer in recent_history:
            # Simple entity extraction - look for capitalized names
            query_entities = re.findall(r'\b[A-Z][a-z]+\b', prev_query)
            answer_entities = re.findall(r'\b[A-Z][a-z]+\b', prev_answer)
            entities.update(query_entities + answer_entities)

        # Remove common words that aren't entities
        entities = entities - self.COMMON_WORDS

        if entities:
            entity_context = ", ".join(sorted(entities))
            enhanced_query = (
                f"{query}\n\n[Context Note: Related entities from previous discussion: {entity_context}]"
            )
            logger.info(f"Enhanced query with context note for entities: {entity_context}")
            return enhanced_query

        return query
    
    def _query_mentions_entities(self, query: str) -> bool:
        """Check if query mentions specific entities (names, people)"""
        # Look for capitalized names that could be entities
        entities = re.findall(r'\b[A-Z][a-z]+\b', query)
        actual_entities = [e for e in entities if e not in self.COMMON_WORDS]
        return len(actual_entities) > 0
        return len(actual_entities) > 0

    def _process_analyze_all_query(self, space_id: str, query: str, user_id: str = None) -> Dict[str, Any]:
        relevant_chunks = get_all_chunks_from_space(
            space_id,
            max_chunks=MAX_CHUNKS_ANALYZE_ALL,
            user_id=user_id
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

    def _process_prev_context_query(self, space_id: str, query: str, user_id: str = None) -> Dict[str, Any]:
        history = self.chat_history.get(space_id, [])

        if not history:
            logger.warning(f"No chat history found for space {space_id}, falling back to specific query")
            return self._process_specific_query(space_id, query, user_id)

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

    def _process_specific_query(self, space_id: str, query: str, user_id: str = None) -> Dict[str, Any]:
        # Enhance query with chat history context for entity recognition
        enhanced_query = self._enhance_query_with_context(space_id, query)
        expanded_query = expand_query(enhanced_query)
        
        relevant_chunks = query_documents_hybrid(
            expanded_query,
            top_k=TOP_K_CHUNKS,
            space_id=space_id,
            user_id=user_id
        )

        if not relevant_chunks:
            # Fallback: Try as cross-document query if no specific results found
            logger.info("No specific results found, trying cross-document approach")
            return self._process_cross_document_query(space_id, query, user_id)

        relevant_chunks = relevant_chunks[:MAX_RELEVANT_CHUNKS]

        context, sources, current_tokens = self.context_builder.build_context_for_specific_query(
            relevant_chunks,
            MAX_CONTEXT_TOKENS_SPECIFIC,
            DISTANCE_THRESHOLD
        )
        
        # Check if we have multi-document coverage, if not and query mentions entities, try cross-document
        unique_filenames = set(chunk.get('filename', 'N/A') for chunk in relevant_chunks)
        if len(unique_filenames) == 1 and self._query_mentions_entities(query):
            logger.info("Single document result for entity query, trying cross-document approach")
            return self._process_cross_document_query(space_id, query, user_id)

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

    def _process_cross_document_query(self, space_id: str, query: str, user_id: str = None) -> Dict[str, Any]:
        """
        Document-aware two-stage retrieval for cross-document queries:
        1. Retrieve initial relevant chunks using semantic search
        2. Extract key info and query target document(s)
        3. Synthesize results from multiple documents
        """

        source_chunks = query_documents_hybrid(
            query,
            top_k=10,
            space_id=space_id,
            user_id=user_id
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
            space_id=space_id,
            user_id=user_id
        )

        # Use filename-based deduplication to ensure multi-document representation
        seen_filenames = set()
        combined_chunks = []
        
        # First, add chunks from different documents (prioritize diversity)
        all_chunks = source_chunks[:8] + target_chunks[:8]
        
        # Sort by distance to get best chunks first
        all_chunks.sort(key=lambda x: x.get('distance', 999))
        
        for chunk in all_chunks:
            filename = chunk.get('filename', 'unknown')
            if filename not in seen_filenames:
                seen_filenames.add(filename)
                combined_chunks.append(chunk)
                
        # Then add additional chunks from already seen documents if we have space
        for chunk in all_chunks:
            if len(combined_chunks) >= 10:  # Limit total chunks
                break
            if chunk not in combined_chunks:
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
