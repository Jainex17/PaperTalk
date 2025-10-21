import logging
from typing import Optional
from openai import OpenAI

from config.config import settings

logger = logging.getLogger(__name__)


class AIService:

    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY
        )

    def generate_response(self, prompt: str) -> Optional[str]:
        try:
            response = self.client.chat.completions.create(
                model="openai/gpt-4o",
                messages=[{"role": "user", "content": prompt}]
            )

            if not response or not response.choices[0].message.content:
                logger.error("Empty response from AI model")
                return None

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            raise
