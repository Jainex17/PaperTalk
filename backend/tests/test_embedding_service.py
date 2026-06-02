import os
import sys
import unittest
from unittest.mock import Mock


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("DATABASE_URL", "sqlite:///test.db")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("BACKEND_URL", "http://localhost:8000")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("OPENROUTER_API_KEY", "test-openrouter-key")

from services.embedding_service import GeminiEmbeddingService


class GeminiEmbeddingServiceTests(unittest.TestCase):
    def test_embed_documents_uses_retrieval_document_task_and_title(self):
        client = Mock()
        client.models.embed_content.return_value.embeddings = [
            Mock(values=[0.1, 0.2]),
            Mock(values=[0.3, 0.4]),
        ]
        service = GeminiEmbeddingService(
            api_key="test-key",
            model_name="gemini-embedding-001",
            output_dimensionality=768,
            client=client,
        )

        embeddings = service.embed_documents(["chunk one", "chunk two"], title="paper.pdf")

        self.assertEqual(embeddings, [[0.1, 0.2], [0.3, 0.4]])
        client.models.embed_content.assert_called_once()
        _, kwargs = client.models.embed_content.call_args
        self.assertEqual(kwargs["model"], "gemini-embedding-001")
        self.assertEqual(kwargs["contents"], ["chunk one", "chunk two"])
        self.assertEqual(kwargs["config"].task_type, "RETRIEVAL_DOCUMENT")
        self.assertEqual(kwargs["config"].title, "paper.pdf")
        self.assertEqual(kwargs["config"].output_dimensionality, 768)

    def test_embed_query_uses_retrieval_query_task(self):
        client = Mock()
        client.models.embed_content.return_value.embeddings = [Mock(values=[0.5, 0.6])]
        service = GeminiEmbeddingService(
            api_key="test-key",
            model_name="gemini-embedding-001",
            output_dimensionality=768,
            client=client,
        )

        embedding = service.embed_query("what is attention")

        self.assertEqual(embedding, [0.5, 0.6])
        _, kwargs = client.models.embed_content.call_args
        self.assertEqual(kwargs["config"].task_type, "RETRIEVAL_QUERY")
        self.assertIsNone(kwargs["config"].title)


if __name__ == "__main__":
    unittest.main()
