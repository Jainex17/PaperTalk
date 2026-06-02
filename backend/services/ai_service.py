import logging
from typing import Optional
from openai import OpenAI
from google import genai

from config.config import settings
from constants import OPENROUTER_MODEL, OPENROUTER_MODELS, GEMINI_MODEL, GEMINI_MODELS

logger = logging.getLogger(__name__)


class AIService:

    def __init__(self):
        self._init_provider("openrouter")

    def _init_provider(self, provider: str):
        self.provider = provider.lower()

        if self.provider == "openrouter":
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=settings.OPENROUTER_API_KEY
            )
            self.fallback_client = None
            if settings.OPENROUTER_API_KEY1:
                self.fallback_client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=settings.OPENROUTER_API_KEY1
                )
        elif self.provider == "gemini":
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            self.fallback_client = None
        else:
            raise ValueError(f"Unknown ANSWER_PROVIDER: {self.provider}. Must be 'openrouter' or 'gemini'.")

    def _resolve_model(self, model: str = None) -> str:
        if model:
            return model
        return OPENROUTER_MODEL if self.provider == "openrouter" else GEMINI_MODEL

    def generate_response(self, prompt: str, max_tokens: int = 2000, provider: str = None, model: str = None) -> Optional[str]:
        if provider and provider.lower() != self.provider:
            self._init_provider(provider)

        resolved_model = self._resolve_model(model)

        if self.provider == "openrouter":
            return self._generate_openrouter(prompt, max_tokens, resolved_model)
        else:
            return self._generate_gemini(prompt, max_tokens, resolved_model)

    def _generate_openrouter(self, prompt: str, max_tokens: int, model: str) -> Optional[str]:
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens
            )

            if not response or not response.choices[0].message.content:
                logger.error("Empty response from OpenRouter model")
                return None

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error generating AI response with primary key: {str(e)}")

            if self.fallback_client:
                logger.info("Attempting to use fallback OpenRouter API key...")
                try:
                    response = self.fallback_client.chat.completions.create(
                        model=model,
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

    def _generate_gemini(self, prompt: str, max_tokens: int, model: str) -> Optional[str]:
        try:
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config={
                    "temperature": 0.4,
                    "max_output_tokens": max_tokens,
                }
            )

            if not response or not response.text:
                logger.error("Empty response from Gemini model")
                return None

            return response.text

        except Exception as e:
            logger.error(f"Error generating AI response with Gemini: {str(e)}")
            raise
