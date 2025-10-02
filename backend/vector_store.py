from sentence_transformers import SentenceTransformer
from sqlalchemy import func, cast, text
from pgvector.sqlalchemy import Vector
import uuid

from db_utils import SessionLocal, Document, Spaces

embed_model = SentenceTransformer("all-mpnet-base-v2")

def upload_document(chunks, space_id, filename=None):
    file_id = str(uuid.uuid4()) 
    session = SessionLocal()
    
    try:
        space_exists = session.query(Spaces).filter_by(id=space_id).scalar()
        if not space_exists:
            session.execute(text("INSERT INTO spaces (id, name) VALUES (:id, :name)"), {"id": space_id, "name": "Untitled Space"})
            session.commit()

        for i, chunk in enumerate(chunks):
            embedding = embed_model.encode(chunk).tolist()
            doc = Document(
                doc_id=f"doc_{file_id}_{i}",
                original_file_id=filename,
                chunk_index=i,
                text=chunk,
                space_id=space_id,
                embedding=embedding
            )
            session.add(doc)

        session.commit()
        session.close()
        return file_id
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
        

def query_documents(query, top_k=3, space_id="default"):
    query_embedding = embed_model.encode([query])[0].tolist()
    session = SessionLocal()

    result = (
        session.query(
            Document.doc_id,
            Document.text,
            func.l2_distance(Document.embedding, cast(query_embedding, Vector(768))).label("distance")
        )
        .filter(Document.space_id == space_id)
        .order_by("distance")
        .limit(top_k)
        .all()
)
    session.close()
    return [{"doc_id": r[0], "text": r[1], "distance": r[2]} for r in result]