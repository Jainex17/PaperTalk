import logging
import uuid
from typing import Dict, Optional
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import httpx

from config.config import settings
from db_utils import get_user_by_email, create_user
from auth_utils import create_access_token

logger = logging.getLogger(__name__)

required_settings = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
missing = [s for s in required_settings if not getattr(settings, s, None)]
if missing:
    raise RuntimeError(f"Missing required OAuth settings: {', '.join(missing)}")

config = Config(environ={
    "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": settings.GOOGLE_CLIENT_SECRET,
})

oauth = OAuth(config)

class AuthService:
    """Service for handling Google OAuth authentication."""

    _httpx_client: Optional[httpx.AsyncClient] = None

    @classmethod
    def get_httpx_client(cls) -> httpx.AsyncClient:
        if cls._httpx_client is None:
            cls._httpx_client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0, connect=10.0),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            )
        return cls._httpx_client

    @classmethod
    async def close_httpx_client(cls):
        if cls._httpx_client is not None:
            await cls._httpx_client.aclose()
            cls._httpx_client = None

    @classmethod
    def register_google_oauth(cls):
        oauth.register(
            name='google',
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile'
            },
            client=cls.get_httpx_client()
        )

    @staticmethod
    async def get_google_oauth_client():
        """Get configured Google OAuth client."""
        return oauth.google

    @staticmethod
    def process_google_user(user_info: Dict) -> Dict[str, str]:
        """
        Process Google user info and create/update user in database.
        """
        try:
            email = user_info.get("email")
            name = user_info.get("name", "")
            picture = user_info.get("picture")

            if not email:
                raise ValueError("Email not provided by Google")

            # Check if user exists
            existing_user = get_user_by_email(email)

            if existing_user:
                user = existing_user
                logger.info(f"Existing user logged in: {email}")
            else:
                # Create new user
                user_id = str(uuid.uuid4())
                user = create_user(
                    user_id=user_id,
                    email=email,
                    name=name,
                    picture=picture
                )
                logger.info(f"New user created: {email}")

            token_data = {
                "sub": user["email"],
                "name": user["name"],
                "picture": user["picture"],
                "user_id": user["id"]
            }
            access_token = create_access_token(data=token_data)

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"],
                    "picture": user["picture"]
                }
            }

        except Exception as e:
            logger.error(f"Error processing Google user: {str(e)}", exc_info=True)
            raise


# Register Google OAuth when the module is loaded
AuthService.register_google_oauth()
