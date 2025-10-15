from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    space_id: str = Field(..., description="ID of the space to query")
    query: str = Field(..., min_length=1, description="User's question")
    is_first_message: bool = Field(default=False, description="Flag to clear chat history")


class RenameSpaceRequest(BaseModel):
    new_name: str = Field(..., min_length=1, description="New name for the space")


class SourceDocument(BaseModel):
    doc_id: str
    filename: str
    chunk_text: str
    relevance_score: Any


class DebugInfo(BaseModel):
    context_tokens: int
    chunks_used: int
    chunks_available: int


class AskResponse(BaseModel):
    answer: str
    sources: List[SourceDocument]
    debug: Optional[DebugInfo] = None


class ErrorResponse(BaseModel):
    error: str


class UploadResponse(BaseModel):
    fileid: str
    chunk_count: int
    filename: Optional[str] = None


class SpaceResponse(BaseModel):
    id: str
    name: str
    created_at: str


class SpaceDetailsResponse(BaseModel):
    id: str
    name: str
    created_at: str
    documents: List[str]


class MessageResponse(BaseModel):
    message: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
