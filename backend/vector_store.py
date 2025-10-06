import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any

from sentence_transformers import SentenceTransformer
from sqlalchemy import func, cast, text
from pgvector.sqlalchemy import Vector

from db_utils import get_db_session, Document, Spaces
from constants import DEFAULT_SPACE_NAME, QUERY_TYPE_ANALYZE_ALL

logger = logging.getLogger(__name__)

embed_model = SentenceTransformer("all-mpnet-base-v2")

def upload_document(chunks: List[str], space_id: str, filename: str = None) -> str:
    file_id = str(uuid.uuid4())

    with get_db_session() as session:
        try:
            space_exists = session.query(Spaces).filter_by(id=space_id).scalar()
            if not space_exists:
                new_space = Spaces(
                    id=space_id,
                    name=DEFAULT_SPACE_NAME,
                    created_at=datetime.now()
                )
                session.add(new_space)
                session.commit()
                logger.info(f"Created new space: {space_id}")

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
            logger.info(f"Uploaded {len(chunks)} chunks for file {filename} to space {space_id}")
            return file_id

        except Exception as e:
            logger.error(f"Error uploading document: {str(e)}", exc_info=True)
            session.rollback()
            raise

def query_documents_hybrid(
    query: str,
    top_k: int = 10,
    space_id: str = "default"
) -> List[Dict[str, Any]]:
    query_embedding = embed_model.encode([query])[0].tolist()

    with get_db_session() as session:
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
            doc_id, text, _chunk_idx, filename, distance = r
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

        logger.info(f"Found {len(boosted_results)} results for query in space {space_id}")
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

    expanded = " ".join(expanded_terms)
    logger.debug(f"Expanded query from '{query}' to '{expanded}'")
    return expanded

def get_all_chunks_from_space(space_id: str, max_chunks: int = 50) -> List[Dict[str, Any]]:
    with get_db_session() as session:
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

            chunks = [
                {
                    "doc_id": r[0],
                    "text": r[1],
                    "chunk_index": r[2],
                    "filename": r[3]
                }
                for r in results
            ]

            logger.info(f"Retrieved {len(chunks)} chunks from space {space_id}")
            return chunks

        except Exception as e:
            logger.error(f"Error retrieving chunks from space {space_id}: {str(e)}", exc_info=True)
            raise

def classify_query(query: str) -> str:
    query_lower = query.lower()

    analyze_all_keywords = [
        "summarize", "summary", "overview", "key points", "main ideas", "synthesize",
        "main conclusions", "extract insights", "best practices", "recommendations",
        "bullet points", "concise", "brief", "what are the", "list the"
    ]

    for keyword in analyze_all_keywords:
        if keyword in query_lower:
            logger.debug(f"Classified query as 'analyze_all' based on keyword: {keyword}")
            return "analyze_all"

    logger.debug("Classified query as 'specific'")
    return "specific"
