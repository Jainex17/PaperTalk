import asyncio
import re
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from services.ai_service import AIService
from services.context_builder import ContextBuilder
from prompts import SYNTHESIS_PROMPT_TEMPLATE
from vector_store import query_documents_hybrid, expand_query
import logging

logger = logging.getLogger(__name__)

class SearchStrategy(BaseModel):
    """Search strategy used to run retrieval."""
    reasoning: str = Field(..., description="Brief explanation of strategy")
    searches: List[str] = Field(..., description="List of search queries to execute")
    query_type: str = Field(..., description="Type of query: simple, complex, or analytical")
    estimated_complexity: int = Field(..., ge=1, le=5, description="Complexity score from 1-5")

class StrategyService:
    STOPWORDS = {
        "the", "a", "an", "is", "are", "was", "were", "to", "of", "in", "on", "for",
        "and", "or", "with", "from", "what", "which", "who", "how", "why", "when",
        "can", "could", "would", "should", "please", "about", "tell", "explain",
    }

    def generate_strategy(self, query: str, space_id: str) -> SearchStrategy:
        """
        Generate a deterministic strategy.
        This removes an extra LLM call from the hot path while keeping recall-oriented search.
        """
        normalized = " ".join(query.split())
        expanded = expand_query(normalized)
        keyword_focus = self._extract_keywords(normalized)

        searches = [normalized]
        if expanded != normalized:
            searches.append(expanded)
        if keyword_focus and keyword_focus != normalized:
            searches.append(keyword_focus)

        # Strong recall bias for complex prompts: include a broad natural-language variant.
        if len(normalized.split()) >= 12:
            searches.append(f"key points and evidence about {normalized}")

        # Deduplicate and cap to keep latency predictable.
        deduped = []
        seen = set()
        for s in searches:
            stripped = s.strip()
            if stripped and stripped not in seen:
                deduped.append(stripped)
                seen.add(stripped)

        query_type = "simple" if len(normalized.split()) <= 6 else "complex"
        if len(deduped) >= 4:
            query_type = "analytical"

        strategy = SearchStrategy(
            reasoning="Deterministic high-recall query expansion without extra LLM round-trip.",
            searches=deduped[:4],
            query_type=query_type,
            estimated_complexity=min(5, max(1, len(deduped) + 1)),
        )
        logger.info(f"Built strategy: {strategy.query_type} with {len(strategy.searches)} searches")
        return strategy

    def _extract_keywords(self, query: str) -> str:
        tokens = re.findall(r"[A-Za-z0-9][A-Za-z0-9_-]{2,}", query.lower())
        keywords = [t for t in tokens if t not in self.STOPWORDS]
        return " ".join(keywords[:8])

class RetrievalService:
    
    async def _search_single(
        self,
        query: str,
        space_id: str,
        user_id: str,
        top_k: int
    ) -> List[Dict[str, Any]]:
        """Execute single search asynchronously"""
        return query_documents_hybrid(
            query=query,
            top_k=top_k,
            space_id=space_id,
            user_id=user_id
        )

    async def execute_searches_parallel(
        self,
        searches: List[str],
        space_id: str,
        user_id: str,
        top_k: int = 10
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Execute multiple searches in parallel
        Returns: {search_query: [results]}
        """
        tasks = [
            self._search_single(search, space_id, user_id, top_k)
            for search in searches
        ]

        results = await asyncio.gather(*tasks)

        # Map search queries to their results
        search_results = {
            search: result
            for search, result in zip(searches, results)
        }

        return search_results

class SynthesisService:
    def __init__(self):
        self.ai_service = AIService()
        self.context_builder = ContextBuilder()

    def synthesize_answer(
        self,
        query: str,
        search_results: Dict[str, List[Dict[str, Any]]],
        strategy: SearchStrategy
    ) -> Dict[str, Any]:
        """
        Synthesize final answer from all search results
        """

        all_chunks = []
        for search_query, chunks in search_results.items():
            all_chunks.extend(chunks)

        unique_chunks = self._deduplicate_chunks(all_chunks)

        # Build context using the specific query method (it handles token limits well)
        context, sources, tokens = self.context_builder.build_context_for_specific_query(
            unique_chunks,
            max_tokens=8000,
            distance_threshold=1.5  # More lenient for synthesis
        )

        prompt = SYNTHESIS_PROMPT_TEMPLATE.format(
            strategy_reasoning=strategy.reasoning,
            original_query=query,
            search_queries="\n".join([f"- {s}" for s in strategy.searches]),
            context=context
        )

        answer = self.ai_service.generate_response(prompt)

        return {
            "answer": answer,
            "sources": sources,
            "debug": {
                "context_tokens": tokens,
                "chunks_used": len(unique_chunks),
                "chunks_available": len(all_chunks)
            }
        }
    
    def _deduplicate_chunks(self, chunks: List[Dict]) -> List[Dict]:
        """Remove duplicate chunks by doc_id"""
        seen = set()
        unique = []
        for chunk in chunks:
            if chunk['doc_id'] not in seen:
                seen.add(chunk['doc_id'])
                unique.append(chunk)
        return unique

class RAGPipeline:
    def __init__(self):
        self.strategy_service = StrategyService()
        self.retrieval_service = RetrievalService()
        self.synthesis_service = SynthesisService()
    
    async def process_query(
        self,
        query: str,
        space_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Main pipeline execution
        """
        try:
            logger.info(f"Stage 1: Building retrieval strategy for query: {query}")
            strategy = self.strategy_service.generate_strategy(query, space_id)

            logger.info(f"Generated {len(strategy.searches)} searches")

            logger.info("Stage 2: Executing parallel searches")
            search_results = await self.retrieval_service.execute_searches_parallel(
                searches=strategy.searches,
                space_id=space_id,
                user_id=user_id,
                top_k=10
            )

            logger.info("Stage 3: Synthesizing final answer")
            result = self.synthesis_service.synthesize_answer(
                query=query,
                search_results=search_results,
                strategy=strategy
            )
            logger.info("Pipeline complete")

            return result
        except Exception as e:
            logger.error(f"Pipeline error: {str(e)}", exc_info=True)
            raise
