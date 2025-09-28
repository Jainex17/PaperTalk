from sentence_transformers import SentenceTransformer
import chromadb

embed_model = SentenceTransformer("all-MiniLM-L6-v2")

dbclient = chromadb.Client()
collection = dbclient.create_collection("papertalk_docs")

def add_document(chunks):
    for i, chunk in enumerate(chunks):
        embedding = embed_model.encode(chunk).tolist()
        collection.add(
            ids=[f"doc_{i}"],
            documents=[chunk],
            embeddings=[embedding]
        )

def query_documents(query, top_k=3):
    query_emb = embed_model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=top_k
    )
    return results["documents"][0] if results["documents"] else []
