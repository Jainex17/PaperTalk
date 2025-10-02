from sqlalchemy import create_engine, Column, String, Integer, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from pgvector.sqlalchemy import Vector

from config.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    doc_id = Column(String, nullable=False)
    original_file_id = Column(String, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    space = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=False)

Base.metadata.create_all(engine)

def get_all_spaces():
    session = SessionLocal()
    try:
        result = session.query(Document.space).distinct().all()
        
        spaces = []
        for row in result:
            spaces.append(row.space)

        return spaces
    except Exception as e:
        print("err :( ", e)
        return []
    finally:
        session.close()