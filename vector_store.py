from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, Column, String, Integer, Text, text, func, cast
from sqlalchemy.orm import declarative_base, sessionmaker
from pgvector.sqlalchemy import Vector
import uuid

from config.config import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    doc_id = Column(String, unique=True, nullable=False)
    space = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=False) 

Base.metadata.create_all(engine)
embed_model = SentenceTransformer("all-mpnet-base-v2")

def add_document(chunks, space="default"):
    file_id = str(uuid.uuid4()) 
    session = SessionLocal()
    
    for i, chunk in enumerate(chunks):
        embedding = embed_model.encode(chunk).tolist()
        doc = Document(doc_id=f"doc_{file_id}_{i}", text=chunk, space=space, embedding=embedding)
        session.add(doc)

    session.commit()
    session.close()
        

def query_documents(query, top_k=3, space="default"):
    query_embedding = embed_model.encode([query])[0].tolist()
    session = SessionLocal()

    result = (
        session.query(
            Document.doc_id,
            Document.text,
            func.l2_distance(Document.embedding, cast(query_embedding, Vector(768))).label("distance")
        )
        .filter(Document.space == space)
        .order_by("distance")
        .limit(top_k)
        .all()
)
    session.close()
    return [{"doc_id": r[0], "text": r[1], "distance": r[2]} for r in result]