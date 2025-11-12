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
        # Create fallback client if backup key is available
        self.fallback_client = None
        if settings.OPENROUTER_API_KEY1:
            self.fallback_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=settings.OPENROUTER_API_KEY1
            )

    def generate_response(self, prompt: str, max_tokens: int = 2000) -> Optional[str]:
        try:
            response = self.client.chat.completions.create(
                model="openai/gpt-oss-20b:free",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens
            )

            if not response or not response.choices[0].message.content:
                logger.error("Empty response from AI model")
                return None

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error generating AI response with primary key: {str(e)}")

            # Try fallback key if available
            if self.fallback_client:
                logger.info("Attempting to use fallback OpenRouter API key...")
                try:
                    response = self.fallback_client.chat.completions.create(
                        model="openai/gpt-oss-20b:free",
                        messages=[{"role": "user", "content": prompt}],
                        max_tokens=max_tokens
                    )

                    if not response or not response.choices[0].message.content:
                        logger.error("Empty response from AI model with fallback key")
                        return None

                    logger.info("Successfully generated response using fallback key")
                    return response.choices[0].message.content

                except Exception as fallback_error:
                    logger.error(f"Error generating AI response with fallback key: {str(fallback_error)}")
                    raise
            else:
                raise
