import sys
import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    GEMINI_API_KEY: str
    DATABASE_URL: str
    FRONTEND_URL: str
    BACKEND_URL: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    JWT_SECRET_KEY: str
    OPENROUTER_API_KEY: str

try:
    settings = Settings()
    logger.info("All required environment variables loaded successfully")
except ValidationError as e:
    logger.error("Missing or invalid required environment variables:")
    for error in e.errors():
        field = error['loc'][0]
        logger.error(f"  - {field}: {error['msg']}")
    logger.error("\nPlease check your .env file and ensure all required variables are set.")
    logger.error("See .env.example for reference.")
    sys.exit(1)
