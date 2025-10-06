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
        
def query_documents_hybrid(query, top_k=10, space_id="default"):
    query_embedding = embed_model.encode([query])[0].tolist()
    session = SessionLocal()

    semantic_results = (
        session.query(
            Document.doc_id,
            Document.text,
            Document.chunk_index,
            Document.original_file_id.label("filename"),
            func.l2_distance(Document.embedding, cast(query_embedding, Vector(768))).label("distance"),
        )
        .filter(Document.space_id == space_id)
        .order_by("distance")
        .limit(top_k * 2)
        .all()
    )

    query_terms = query.lower().split()
    boosted_results = []

    for r in semantic_results:
        doc_id, text, chunk_idx, filename, distance = r
        text_lower = text.lower()

        keyword_matches = sum(1 for term in query_terms if term in text_lower)
        boosted_distance = distance - (keyword_matches * 0.1)
        boosted_results.append({
              "doc_id": doc_id,
              "text": text,
              "distance": boosted_distance,
              "filename": filename
          })
        
    boosted_results.sort(key=lambda x: x["distance"])

    session.close()
    return boosted_results[:top_k]

def expand_query(query: str) -> str:
    expansions = {
        "best practices": ["best practices", "recommended methods", "standard procedures"],
        "challenges": ["challenges", "difficulties", "obstacles"],
        "benefits": ["benefits", "advantages", "positive aspects"],
        "authors": ["authors", "writers", "creators", "contributors"],
        "summary": ["summary", "overview", "abstract", "key points"]
    }

    expanded_terms = [query]
    query_lower = query.lower()

    for key, synonyms in expansions.items():
        if key in query_lower:
            expanded_terms.extend(synonyms)

    return " ".join(expanded_terms)

def get_all_chunks_from_space(space_id: str, max_chunks: int = 50):
    session = SessionLocal()

    try:
        results = (
            session.query(
                Document.doc_id,
                Document.text,
                Document.chunk_index,
                Document.original_file_id.label("filename"),
            )
            .filter(Document.space_id == space_id)
            .order_by(Document.original_file_id, Document.chunk_index)
            .limit(max_chunks)
            .all()
        )

        session.close()
        return [
            {
                "doc_id": r[0],
                "text": r[1],
                "chunk_index": r[2],
                "filename": r[3]
            }
            for r in results
        ]
    except Exception as e:
        session.close()
        raise e
    
def classify_query(query: str) -> str:

    query_lower = query.lower()

    analyze_all_keywords = [
        "summarize", "summary", "overview", "key points", "main ideas", "synthesize",
        "main conclusions", "extract insights", "best practices", "recommendations",
        "bullet points", "concise", "brief", "what are the", "list the"
    ]

    for keyword in analyze_all_keywords:
        if keyword in query_lower:
            return "analyze_all"
        
    return "specific"