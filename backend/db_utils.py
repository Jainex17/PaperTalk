import logging
from typing import List, Dict, Optional
from contextlib import contextmanager

from sqlalchemy import ForeignKey, create_engine, Column, String, Integer, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pgvector.sqlalchemy import Vector

from config.config import settings

logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


@contextmanager
def get_db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

class Spaces(Base):
    __tablename__ = "spaces"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    doc_id = Column(String, nullable=False)
    original_file_id = Column(String, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    space_id = Column(String, ForeignKey('spaces.id'), nullable=False)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=False)

Base.metadata.create_all(engine)

def get_all_spaces() -> List[Dict[str, str]]:
    with get_db_session() as session:
        try:
            result = session.query(Spaces).distinct().all()

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

def get_documents_by_space(space_id: str) -> List[str]:
    with get_db_session() as session:
        try:
            result = session.query(Document.original_file_id).filter(
                Document.space_id == space_id
            ).distinct().all()

            documents = [row[0] for row in result]
            logger.info(f"Retrieved {len(documents)} documents for space {space_id}")
            return documents

        except Exception as e:
            logger.error(f"Error retrieving documents for space {space_id}: {str(e)}", exc_info=True)
            raise

def update_space_name(space_id: str, new_name: str) -> bool:
    with get_db_session() as session:
        try:
            space = session.query(Spaces).filter(Spaces.id == space_id).first()

            if not space:
                logger.warning(f"Space not found: {space_id}")
                return False

            space.name = new_name
            session.commit()
            logger.info(f"Updated space {space_id} name to '{new_name}'")
            return True

        except Exception as e:
            logger.error(f"Error updating space {space_id}: {str(e)}", exc_info=True)
            session.rollback()
            raise

def delete_document(space_id: str, original_file_id: str) -> int:
    """Delete all chunks of a document from a specific space.

    Args:
        space_id: The space ID containing the document
        original_file_id: The original file ID to delete

    Returns:
        Number of chunks deleted
    """
    with get_db_session() as session:
        try:
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
