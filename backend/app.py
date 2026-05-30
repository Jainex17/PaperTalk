import logging
from typing import List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from services import better_retrieval_service
from config.config import settings
from models import (
    AskRequest,
    AskResponse,
    RenameSpaceRequest,
    UploadResponse,
    SpaceResponse,
    SpaceDetailsResponse,
    MessageResponse
)
from services.query_service import QueryService
from services.document_service import DocumentService
from db_utils import get_all_spaces, get_documents_by_space, update_space_name, delete_space, delete_document
from routers import auth
from auth_utils import get_current_user

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="PaperTalk",
    description="Document analysis",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.JWT_SECRET_KEY
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.include_router(auth.router)

query_service = QueryService()
document_service = DocumentService()
rag_pipeline = better_retrieval_service.RAGPipeline()


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown."""
    from services.auth_service import httpx_client
    await httpx_client.aclose()
    logger.info("Closed httpx client")


@app.get("/", tags=["Health"])
def health_check() -> dict:
    return {"status": "running"}


@app.post("/ask", response_model=AskResponse, tags=["Query"])
@limiter.limit("30/minute")  # 30 requests per minute per IP
async def ask_question(
    request: Request,
    body: AskRequest,
    current_user: dict = Depends(get_current_user)
) -> AskResponse:
    _ = request
    try:
        user_id = current_user["user_id"]
        result = await rag_pipeline.process_query(
            query=body.query,
            space_id=body.space_id,
            user_id=user_id,
        )
        return result

    except ValueError as e:
        logger.warning(f"Invalid query: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing your request"
        )


@app.post("/documents/upload", response_model=UploadResponse, tags=["Documents"])
@limiter.limit("10/minute")  # 10 uploads per minute per IP
async def upload_document(
    request: Request,
    space_id: str = Form(...),
    file: UploadFile = File(None),
    text_content: str = Form(None),
    current_user: dict = Depends(get_current_user)
) -> UploadResponse:
    _ = request
    try:
        user_id = current_user["user_id"]

        # Handle text content upload
        if text_content:
            file_id, chunk_count, filename = document_service.process_text_content(
                text_content,
                space_id,
                user_id
            )
            return UploadResponse(fileid=file_id, chunk_count=chunk_count, filename=filename)

        # Handle file upload
        if not file:
            raise ValueError("Either file or text_content must be provided")

        document_service.validate_file(file.filename, file.size)

        file_content = file.file.read()
        file_id, chunk_count = document_service.process_document(
            file_content,
            file.filename,
            space_id,
            user_id
        )

        return UploadResponse(fileid=file_id, chunk_count=chunk_count, filename=file.filename)

    except ValueError as e:
        logger.warning(f"Invalid file upload: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@app.get("/spaces", response_model=List[SpaceResponse], tags=["Spaces"])
@limiter.limit("60/minute")  # 60 requests per minute per IP
async def list_spaces(request: Request, current_user: dict = Depends(get_current_user)) -> List[SpaceResponse]:
    _ = request
    try:
        user_id = current_user["user_id"]
        spaces = get_all_spaces(user_id)
        return [SpaceResponse(**space) for space in spaces]

    except Exception as e:
        logger.error(f"Error retrieving spaces: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve spaces"
        )


@app.get("/spaces/{space_id}", response_model=SpaceDetailsResponse, tags=["Spaces"])
@limiter.limit("60/minute")  # 60 requests per minute per IP
async def get_space_details(
    request: Request,
    space_id: str,
    current_user: dict = Depends(get_current_user)
) -> SpaceDetailsResponse:
    _ = request
    try:
        user_id = current_user["user_id"]

        # Import here to avoid circular dependency
        from db_utils import get_db_session, Spaces
        from datetime import datetime

        with get_db_session() as session:
            # Get space details
            space = session.query(Spaces).filter(
                Spaces.id == space_id,
                Spaces.user_id == user_id
            ).first()

            if not space:
                return SpaceDetailsResponse(
                    id=space_id,
                    name="Untitled Space",
                    created_at=datetime.now().isoformat(),
                    documents=[]
                )

            documents = get_documents_by_space(space_id, user_id)

            return SpaceDetailsResponse(
                id=space.id,
                name=space.name,
                created_at=space.created_at.isoformat(),
                documents=documents
            )

    except Exception as e:
        logger.error(f"Error retrieving space details: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve space details"
        )


@app.patch("/spaces/{space_id}", response_model=MessageResponse, tags=["Spaces"])
@limiter.limit("30/minute")  # 30 requests per minute per IP
async def rename_space(
    request: Request,
    space_id: str,
    body: RenameSpaceRequest,
    current_user: dict = Depends(get_current_user)
) -> MessageResponse:
    _ = request
    try:
        user_id = current_user["user_id"]
        success = update_space_name(space_id, body.new_name, user_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Space not found"
            )

        return MessageResponse(message="Space name updated successfully")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error renaming space: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rename space"
        )


@app.delete("/spaces/{space_id}", response_model=MessageResponse, tags=["Spaces"])
@limiter.limit("30/minute")  # 30 requests per minute per IP
async def delete_space_endpoint(
    request: Request,
    space_id: str,
    current_user: dict = Depends(get_current_user)
) -> MessageResponse:
    _ = request
    try:
        user_id = current_user["user_id"]
        success = delete_space(space_id, user_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Space not found"
            )

        return MessageResponse(message="Space deleted successfully")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error deleting space: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete space"
        )


@app.delete("/documents/{space_id}/{file_id}", response_model=MessageResponse, tags=["Documents"])
@limiter.limit("30/minute")  # 30 requests per minute per IP
async def delete_document_endpoint(
    request: Request,
    space_id: str,
    file_id: str,
    current_user: dict = Depends(get_current_user)
) -> MessageResponse:
    _ = request
    try:
        user_id = current_user["user_id"]
        deleted_count = delete_document(space_id, file_id, user_id)

        if deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found in this space"
            )

        return MessageResponse(message=f"Document deleted successfully ({deleted_count} chunks removed)")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )
