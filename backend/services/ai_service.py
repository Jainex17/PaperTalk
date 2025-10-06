import logging
from typing import Optional
from google import genai

from config.config import settings
from constants import (
    GEMINI_MODEL,
    TEMPERATURE,
    TOP_P,
    TOP_K,
    MAX_OUTPUT_TOKENS
)

logger = logging.getLogger(__name__)


class AIService:

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def generate_response(self, prompt: str) -> Optional[str]:
        try:
            response = self.client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={
                    "temperature": TEMPERATURE,
                    "max_output_tokens": MAX_OUTPUT_TOKENS,
                    "top_p": TOP_P,
                    "top_k": TOP_K
                }
            )

            if not response or not response.text:
                logger.error("Empty response from AI model")
                return None

            return response.text

        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            raise
