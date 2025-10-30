import logging
from typing import List, Dict, Optional
from contextlib import contextmanager

from sqlalchemy import ForeignKey, create_engine, Column, String, Integer, Text, DateTime, Index
from sqlalchemy import text as sql_text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pgvector.sqlalchemy import Vector

from config.config import settings

logger = logging.getLogger(__name__)

# Defer database connection until first use
_engine = None
_SessionLocal = None
Base = declarative_base()

def get_engine():
    """Get database engine, creating it if necessary"""
    global _engine
    if _engine is None:
        try:
            DATABASE_URL = settings.DATABASE_URL
            logger.info("Creating database engine...")
            _engine = create_engine(
                DATABASE_URL,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={
                    "connect_timeout": 10,
                    "keepalives": 1,
                    "keepalives_idle": 30,
                    "keepalives_interval": 10,
                    "keepalives_count": 5,
                }
            )
            logger.info("Database engine created successfully")
        except Exception as e:
            logger.error(f"Failed to create database engine: {e}")
            raise
    return _engine

def get_session_local():
    """Get session maker, creating it if necessary"""
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(bind=engine)
    return _SessionLocal


@contextmanager
def get_db_session():
    SessionLocal = get_session_local()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

class Users(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False)


class Spaces(Base):
    __tablename__ = "spaces"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    __table_args__ = (
        Index('ix_spaces_user_id_space_id', 'user_id', 'id'),
    )

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    doc_id = Column(String, nullable=False)
    original_file_id = Column(String, nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    space_id = Column(String, ForeignKey('spaces.id'), nullable=False, index=True)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=sql_text("now()"))

    __table_args__ = (
        Index('ix_documents_space_id_embedding', 'space_id', 'embedding', postgresql_using='ivfflat', postgresql_ops={'embedding': 'vector_l2_ops'}),
    )

Base.metadata.create_all(engine)

def get_all_spaces(user_id: str) -> List[Dict[str, str]]:
    with get_db_session() as session:
        try:
            result = session.query(Spaces).where(Spaces.user_id == user_id).distinct().all()

            spaces = [
                {
                    "id": row.id,
                    "name": row.name,
                    "created_at": row.created_at.isoformat() if hasattr(row.created_at, 'isoformat') else str(row.created_at)
                }
                for row in result
            ]

            logger.info(f"Retrieved {len(spaces)} spaces")
            return spaces

        except Exception as e:
            logger.error(f"Error retrieving spaces: {str(e)}", exc_info=True)
            raise

def get_documents_by_space(space_id: str, user_id: str) -> List[str]:
    with get_db_session() as session:
        try:
            # First verify the space belongs to the user
            space = session.query(Spaces).filter(
                Spaces.id == space_id,
                Spaces.user_id == user_id
            ).first()

            if not space:
                logger.warning(f"Space not found or unauthorized: {space_id} for user {user_id}")
                return []

            result = session.query(Document.original_file_id).filter(
                Document.space_id == space_id
            ).distinct().all()

            documents = [row[0] for row in result]
            logger.info(f"Retrieved {len(documents)} documents for space {space_id}")
            return documents

        except Exception as e:
            logger.error(f"Error retrieving documents for space {space_id}: {str(e)}", exc_info=True)
            raise

def update_space_name(space_id: str, new_name: str, user_id: str) -> bool:
    with get_db_session() as session:
        try:
            space = session.query(Spaces).filter(
                Spaces.id == space_id,
                Spaces.user_id == user_id
            ).first()

            if not space:
                logger.warning(f"Space not found or unauthorized: {space_id} for user {user_id}")
                return False

            space.name = new_name
            session.commit()
            logger.info(f"Updated space {space_id} name to '{new_name}'")
            return True

        except Exception as e:
            logger.error(f"Error updating space {space_id}: {str(e)}", exc_info=True)
            session.rollback()
            raise

def delete_space(space_id: str, user_id: str) -> bool:
    """Delete a space and all its associated documents.
    """
    with get_db_session() as session:
        try:
            # First verify the space belongs to the user
            space = session.query(Spaces).filter(
                Spaces.id == space_id,
                Spaces.user_id == user_id
            ).first()

            if not space:
                logger.warning(f"Space not found or unauthorized: {space_id} for user {user_id}")
                return False

            # Delete all documents (chunks) in the space
            deleted_chunks = session.query(Document).filter(
                Document.space_id == space_id
            ).delete()

            # Delete the space itself
            session.delete(space)
            session.commit()

            logger.info(f"Deleted space {space_id} with {deleted_chunks} chunks for user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Error deleting space {space_id}: {str(e)}", exc_info=True)
            session.rollback()
            raise

def delete_document(space_id: str, original_file_id: str, user_id: str) -> int:
    """Delete all chunks of a document from a specific space.
    """
    with get_db_session() as session:
        try:
            # First verify the space belongs to the user
            space = session.query(Spaces).filter(
                Spaces.id == space_id,
                Spaces.user_id == user_id
            ).first()

            if not space:
                logger.warning(f"Space not found or unauthorized: {space_id} for user {user_id}")
                return 0

            deleted_count = session.query(Document).filter(
                Document.space_id == space_id,
                Document.original_file_id == original_file_id
            ).delete()

            session.commit()
            logger.info(f"Deleted {deleted_count} chunks for document '{original_file_id}' in space {space_id}")
            return deleted_count

        except Exception as e:
            logger.error(f"Error deleting document {original_file_id} from space {space_id}: {str(e)}", exc_info=True)
            session.rollback()
            raise

def verify_space_access(space_id: str, user_id: str) -> bool:
    """Verify that a user has access to a specific space.
    """
    with get_db_session() as session:
        try:
            space = session.query(Spaces).filter(
                Spaces.id == space_id,
                Spaces.user_id == user_id
            ).first()

            if not space:
                logger.warning(f"Space access denied: {space_id} for user {user_id}")
                return False

            return True

        except Exception as e:
            logger.error(f"Error verifying space access: {str(e)}", exc_info=True)
            raise


def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email address.
    """
    with get_db_session() as session:
        try:
            user = session.query(Users).filter(Users.email == email).first()
            if not user:
                return None

            return {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture,
                "created_at": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at)
            }
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {str(e)}", exc_info=True)
            raise

def create_user(user_id: str, email: str, name: str, picture: Optional[str] = None) -> Dict:
    """Create a new user.
    """
    from datetime import datetime, timezone

    with get_db_session() as session:
        try:
            new_user = Users(
                id=user_id,
                email=email,
                name=name,
                picture=picture,
                created_at=datetime.now(timezone.utc)
            )
            session.add(new_user)
            session.commit()

            logger.info(f"Created new user: {email}")
            return {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "picture": new_user.picture,
                "created_at": new_user.created_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error creating user {email}: {str(e)}", exc_info=True)
            session.rollback()
            raise
