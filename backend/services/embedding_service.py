import logging
from typing import List, Optional

from google import genai
from google.genai import types


logger = logging.getLogger(__name__)


class GeminiEmbeddingService:
    def __init__(
        self,
        api_key: str,
        model_name: str,
        output_dimensionality: int,
        client: Optional[genai.Client] = None,
    ) -> None:
        self.model_name = model_name
        self.output_dimensionality = output_dimensionality
        self.client = client or genai.Client(api_key=api_key)

    def embed_documents(self, texts: List[str], title: Optional[str] = None) -> List[List[float]]:
        if not texts:
            return []

        logger.info("Requesting %s document embeddings from Gemini", len(texts))
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                title=title,
                output_dimensionality=self.output_dimensionality,
            ),
        )
        return [embedding.values for embedding in response.embeddings]

    def embed_query(self, text: str) -> List[float]:
        logger.info("Requesting query embedding from Gemini")
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=[text],
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=self.output_dimensionality,
            ),
        )
        return response.embeddings[0].values
