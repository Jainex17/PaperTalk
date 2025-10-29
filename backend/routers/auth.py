import logging
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.requests import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from models import AuthResponse, UserResponse, MessageResponse
from services.auth_service import AuthService
from auth_utils import get_current_user
from config.config import settings

logger = logging.getLogger(__name__)

# Initialize rate limiter for auth routes
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["Authentication"])

auth_service = AuthService()


@router.get("/google")
@limiter.limit("10/minute")  # 10 login attempts per minute per IP
async def google_login(request: Request):
    """
    Initiate Google OAuth login flow.
    Redirects user to Google's OAuth consent screen.
    """
    try:
        google = await auth_service.get_google_oauth_client()
        if not getattr(settings, "BACKEND_URL", None):
            logger.error("BACKEND_URL is not set in configuration.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="BACKEND_URL is not configured on the server"
            )
        redirect_uri = f"{settings.BACKEND_URL}/auth/google/callback"

        logger.info(f"Using redirect URI: {redirect_uri}")
        return await google.authorize_redirect(request, redirect_uri)

    except Exception as e:
        logger.error(f"Error initiating Google login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate Google login"
        )


@router.get("/google/callback")
@limiter.limit("10/minute")  # 10 callback attempts per minute per IP
async def google_callback(request: Request):
    """
    Handle Google OAuth callback.
    Exchanges authorization code for user info and creates/updates user.
    Sets httpOnly cookie with JWT token.
    """
    try:
        google = await auth_service.get_google_oauth_client()

        # Get access token from Google
        token = await google.authorize_access_token(request)

        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            raise ValueError("Failed to get user info from Google")

        # Process user and create JWT token
        auth_data = auth_service.process_google_user(user_info)

        # Redirect to frontend
        frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else "http://localhost:3000"
        redirect_url = f"{frontend_url}/auth/callback"

        response = RedirectResponse(url=redirect_url)

        # Set httpOnly cookie with JWT token
        response.set_cookie(
            key="auth_token",
            value=auth_data['access_token'],
            httponly=True,
            samesite="lax",
            secure=False,  # Set to True in production with HTTPS
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days in seconds
        )

        return response

    except Exception as e:
        logger.error(f"Error in Google callback: {str(e)}", exc_info=True)
        frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else "http://localhost:3000"
        return RedirectResponse(url=f"{frontend_url}/auth/error?message=Authentication failed")


@router.get("/me", response_model=UserResponse)
@limiter.limit("60/minute")  # 60 requests per minute per IP
async def get_me(request: Request, current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    Requires valid JWT token in Authorization header.
    """
    try:
        return UserResponse(
            id=current_user["user_id"],
            email=current_user["email"],
            name=current_user["name"],
            picture=current_user.get("picture")
        )

    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout endpoint - clears the httpOnly auth cookie.
    """
    logger.info(f"User logged out: {current_user['email']}")
    response = JSONResponse(content={"message": "Successfully logged out"})

    # Clear the auth cookie
    response.delete_cookie(
        key="auth_token",
        path="/",
        samesite="lax"
    )

    return response
