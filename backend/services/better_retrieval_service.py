import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from services.ai_service import AIService
from prompts import STRATEGY_GENERATION_PROMPT, SYNTHESIS_PROMPT_TEMPLATE
from vector_store import query_documents_hybrid
import logging

logger = logging.getLogger(__name__)

class StrategyService:
    def __init__(self):
        self.ai_service = AIService()
    
    def generate_strategy(self, query: str) -> Optional[str]:
        """
        Generate search strategy using LLM
        """

        prompt = STRATEGY_GENERATION_PROMPT.format(query=query)
        response = self.ai_service.generate_response(prompt)
        
        return response

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

class SynthesisService:
    def __init__(self):
        self.ai_service = AIService()
    
    def synthesize_answer(
        self,
        query: str,
        search_results: Dict[str, List[Dict[str, Any]]],
        strategy: Optional[str]
    ) -> Dict[str, Any]:
        """
        Synthesize final answer from all search results
        """

        all_chunks = []
        for search_query, chunks in search_results.items():
            all_chunks.extend(chunks)

        unique_chunks = self._deduplicate_chunks(all_chunks)
        
        context, sources, tokens = self.context_builder.build_context_for_synthesis(
            unique_chunks,
            max_tokens=8000
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
                "num_searches": len(strategy.searches),
                "total_chunks": len(all_chunks),
                "unique_chunks": len(unique_chunks),
                "context_tokens": tokens
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
            logger.info(f"Stage 1: Generating search strategy for query: {query}")
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

            return {
                **result,
                "pipeline_metadata": {
                    "strategy": strategy.dict(),
                    "num_searches": len(strategy.searches)
                }
            }
        except Exception as e:
            logger.error(f"Pipeline error: {str(e)}", exc_info=True)
            raise