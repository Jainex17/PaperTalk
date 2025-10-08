import logging
from typing import List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from config.config import settings
from models import (
    AskRequest,
    AskResponse,
    RenameSpaceRequest,
    UploadResponse,
    SpaceResponse,
    DocumentsResponse,
    MessageResponse
)
from services.query_service import QueryService
from services.document_service import DocumentService
from db_utils import get_all_spaces, get_documents_by_space, update_space_name, delete_document

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PaperTalk",
    description="Document analysis and Q&A system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

query_service = QueryService()
document_service = DocumentService()


@app.get("/", tags=["Health"])
def health_check() -> dict:
    return {"status": "running"}


@app.post("/ask", response_model=AskResponse, tags=["Query"])
def ask_question(body: AskRequest) -> AskResponse:
    try:
        result = query_service.process_query(body.space_id, body.query, body.is_first_message)
        return AskResponse(**result)

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


@app.post("/uploadpdf", response_model=UploadResponse, tags=["Documents"])
def upload_document(
    space_id: str = Form(...),
    file: UploadFile = File(...)
) -> UploadResponse:
    try:
        document_service.validate_file(file.filename, file.size)

        file_content = file.file.read()
        file_id, chunk_count = document_service.process_document(
            file_content,
            file.filename,
            space_id
        )

        return UploadResponse(fileid=file_id, chunk_count=chunk_count)

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
def list_spaces() -> List[SpaceResponse]:
    try:
        spaces = get_all_spaces()
        return [SpaceResponse(**space) for space in spaces]

    except Exception as e:
        logger.error(f"Error retrieving spaces: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve spaces"
        )


@app.get("/getdocuments/{space_id}", response_model=DocumentsResponse, tags=["Documents"])
def list_documents(space_id: str) -> DocumentsResponse:
    try:
        documents = get_documents_by_space(space_id)
        return DocumentsResponse(documents=documents)

    except Exception as e:
        logger.error(f"Error retrieving documents: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )


@app.patch("/spaces/{space_id}", response_model=MessageResponse, tags=["Spaces"])
def rename_space(space_id: str, body: RenameSpaceRequest) -> MessageResponse:
    try:
        success = update_space_name(space_id, body.new_name)

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


@app.delete("/documents/{space_id}/{file_id}", response_model=MessageResponse, tags=["Documents"])
def delete_document_endpoint(space_id: str, file_id: str) -> MessageResponse:
    try:
        deleted_count = delete_document(space_id, file_id)

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
