import importlib.util
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy.sql.schema import MetaData


class DocumentIndexTests(unittest.TestCase):
    def load_db_utils(self):
        module_name = "test_db_utils_module"
        module_path = Path(__file__).resolve().parents[1] / "db_utils.py"
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)

        fake_settings = types.SimpleNamespace(
            DATABASE_URL="postgresql://localhost/test",
            EMBEDDING_DIMENSION=768,
        )

        config_module = types.ModuleType("config.config")
        config_module.settings = fake_settings

        with patch("sqlalchemy.create_engine", return_value=object()), patch.object(
            MetaData, "create_all", return_value=None
        ):
            original_config = sys.modules.get("config.config")
            sys.modules["config.config"] = config_module
            try:
                spec.loader.exec_module(module)
            finally:
                if original_config is None:
                    sys.modules.pop("config.config", None)
                else:
                    sys.modules["config.config"] = original_config

        return module

    def test_document_uses_separate_space_and_embedding_indexes(self):
        module = self.load_db_utils()

        indexes = {index.name: index for index in module.Document.__table__.indexes}

        self.assertIn("ix_documents_space_id", indexes)
        self.assertIn("ix_documents_embedding", indexes)

        embedding_index = indexes["ix_documents_embedding"]
        self.assertEqual(["embedding"], [column.name for column in embedding_index.columns])
        self.assertEqual("ivfflat", embedding_index.dialect_options["postgresql"]["using"])
        self.assertEqual(
            {"embedding": "vector_l2_ops"},
            embedding_index.dialect_options["postgresql"]["ops"],
        )


if __name__ == "__main__":
    unittest.main()
