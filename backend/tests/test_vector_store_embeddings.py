import os
import sys
import types
import unittest
from importlib import import_module, reload
from unittest.mock import Mock, patch


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("DATABASE_URL", "sqlite:///test.db")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("BACKEND_URL", "http://localhost:8000")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("OPENROUTER_API_KEY", "test-openrouter-key")


class VectorStoreEmbeddingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fake_db_utils = types.ModuleType("db_utils")
        fake_db_utils.get_db_session = Mock()
        fake_db_utils.Document = Mock()
        fake_db_utils.Spaces = Mock()
        fake_db_utils.verify_space_access = Mock(return_value=True)
        sys.modules["db_utils"] = fake_db_utils
        cls.vector_store = reload(import_module("vector_store"))

    def tearDown(self):
        self.vector_store._embedding_service = None

    def test_get_embedding_service_builds_service_from_settings_once(self):
        fake_settings = Mock(
            GEMINI_API_KEY="test-key",
            EMBEDDING_MODEL="gemini-embedding-001",
            EMBEDDING_DIMENSION=768,
        )

        with patch.object(self.vector_store, "settings", fake_settings), patch.object(
            self.vector_store, "GeminiEmbeddingService"
        ) as service_cls:
            first = self.vector_store.get_embedding_service()
            second = self.vector_store.get_embedding_service()

        self.assertIs(first, second)
        service_cls.assert_called_once_with(
            api_key="test-key",
            model_name="gemini-embedding-001",
            output_dimensionality=768,
        )


if __name__ == "__main__":
    unittest.main()
