import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config.config import settings

logger = logging.getLogger(__name__)

# Fail fast if JWT_SECRET_KEY is not set
if not settings.JWT_SECRET_KEY or not settings.JWT_SECRET_KEY.strip():
    raise ValueError("JWT_SECRET_KEY must be set in environment variables and cannot be empty or whitespace. Application cannot start without it.")

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary containing user data to encode in token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    logger.info(f"Created access token for user: {data.get('sub')}")
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict]:
    """
    Verify and decode a JWT token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Token verification failed: {str(e)}")
        return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    FastAPI dependency to get current authenticated user from JWT token.
    """
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_email: str = payload.get("sub")
    if user_email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "email": user_email,
        "name": payload.get("name"),
        "picture": payload.get("picture"),
        "user_id": payload.get("user_id")
    }