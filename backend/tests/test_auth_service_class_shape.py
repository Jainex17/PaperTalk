import importlib.util
import sys
import types
import unittest
from pathlib import Path


class AuthServiceShapeTests(unittest.TestCase):
    def load_auth_service(self):
        module_name = "test_auth_service_module"
        module_path = Path(__file__).resolve().parents[1] / "services" / "auth_service.py"
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)

        fake_settings = types.SimpleNamespace(
            GOOGLE_CLIENT_ID="test-client-id",
            GOOGLE_CLIENT_SECRET="test-client-secret",
        )

        config_module = types.ModuleType("config.config")
        config_module.settings = fake_settings

        fake_db_utils = types.ModuleType("db_utils")
        fake_db_utils.get_user_by_email = lambda email: None
        fake_db_utils.create_user = lambda **kwargs: kwargs

        fake_auth_utils = types.ModuleType("auth_utils")
        fake_auth_utils.create_access_token = lambda data: "token"

        original_modules = {
            name: sys.modules.get(name)
            for name in ("config.config", "db_utils", "auth_utils")
        }

        sys.modules["config.config"] = config_module
        sys.modules["db_utils"] = fake_db_utils
        sys.modules["auth_utils"] = fake_auth_utils
        try:
            spec.loader.exec_module(module)
        finally:
            for name, original in original_modules.items():
                if original is None:
                    sys.modules.pop(name, None)
                else:
                    sys.modules[name] = original

        return module

    def test_auth_service_exposes_lifecycle_and_oauth_methods(self):
        module = self.load_auth_service()

        self.assertTrue(hasattr(module.AuthService, "get_httpx_client"))
        self.assertTrue(hasattr(module.AuthService, "close_httpx_client"))
        self.assertTrue(hasattr(module.AuthService, "get_google_oauth_client"))
        self.assertTrue(hasattr(module.AuthService, "process_google_user"))


if __name__ == "__main__":
    unittest.main()
