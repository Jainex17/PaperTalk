from sqlalchemy import ForeignKey, create_engine, Column, String, Integer, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from pgvector.sqlalchemy import Vector

from config.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Spaces(Base):
    __tablename__ = "spaces"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(String, nullable=False)

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

def get_all_spaces():
    session = SessionLocal()
    try:
        result = session.query(Spaces).distinct().all()
        
        spaces = []
        for row in result:
            spaces.append({"id": row.id, "name": row.name, "created_at": row.created_at})

        return spaces
    except Exception as e:
        print("err :( ", e)
        return []
    finally:
        session.close()

def get_documents_by_space(space_id: str):
    session = SessionLocal()
    try:
        result = session.query(Document).filter(Document.space_id == space_id).all()
        
        unique_documents = set()
        for row in result:
            unique_documents.add(row.original_file_id)

        return unique_documents
    except Exception as e:
        print("err :( ", e)
        return []
    finally:
        session.close()