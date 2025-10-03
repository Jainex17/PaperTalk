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
        result = session.query(Document.original_file_id).filter(
            Document.space_id == space_id
        ).distinct().all()
        
        return [row[0] for row in result]
    except Exception as e:
        print("err :( ", e)
        return []
    finally:
        session.close()

def update_space_name(space_id: str, new_name: str):
    session = SessionLocal()
    try:
        space = session.query(Spaces).filter(Spaces.id == space_id).first()
        if space:
            space.name = new_name
            session.commit()
            return True
        return False
    except Exception as e:
        print("err :( ", e)
        session.rollback()
        return False
    finally:
        session.close()