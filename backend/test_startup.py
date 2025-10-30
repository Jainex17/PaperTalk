#!/usr/bin/env python3
"""
Test script to verify the application can start without crashing
"""
import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_imports():
    """Test that all modules can be imported without crashing"""
    logger.info("=== TESTING IMPORTS ===")
    
    try:
        logger.info("Testing config import...")
        from config.config import settings
        logger.info("✓ Config imported successfully")
        
        logger.info("Testing db_utils import...")
        from db_utils import get_db_session
        logger.info("✓ db_utils imported successfully")
        
        logger.info("Testing services import...")
        from services import ai_service, auth_service, document_service, query_service
        logger.info("✓ Services imported successfully")
        
        logger.info("Testing vector_store import...")
        from vector_store import get_embed_model, get_genai_client
        logger.info("✓ vector_store imported successfully")
        
        logger.info("Testing app import...")
        from app import app
        logger.info("✓ FastAPI app imported successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Import failed: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

def test_environment():
    """Test environment variable validation"""
    logger.info("=== TESTING ENVIRONMENT ===")
    
    required_vars = [
        'GEMINI_API_KEY',
        'DATABASE_URL', 
        'JWT_SECRET_KEY',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'OPENROUTER_API_KEY'
    ]
    
    missing = []
    for var in required_vars:
        if not os.environ.get(var):
            missing.append(var)
    
    if missing:
        logger.error(f"Missing environment variables: {missing}")
        logger.error("Set these variables to test locally:")
        for var in missing:
            logger.error(f"  export {var}='your_value_here'")
        return False
    
    logger.info("✓ All required environment variables are set")
    return True

def main():
    """Run all tests"""
    logger.info("=== PAPERTALK STARTUP TEST ===")
    
    # Test environment
    if not test_environment():
        logger.error("Environment test failed - cannot continue")
        return False
    
    # Test imports
    if not test_imports():
        logger.error("Import test failed - application will not start")
        return False
    
    logger.info("=== ALL TESTS PASSED ===")
    logger.info("The application should start successfully on Render")
    return True

if __name__ == "__main__":
    import traceback
    success = main()
    if success:
        logger.info("✓ Startup test completed successfully")
        sys.exit(0)
    else:
        logger.error("✗ Startup test failed")
        sys.exit(1)
