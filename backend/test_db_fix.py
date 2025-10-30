#!/usr/bin/env python3
"""
Test script to verify the database fix works
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

def test_db_import():
    """Test that db_utils can be imported without crashing"""
    try:
        logger.info("Testing db_utils import...")
        from db_utils import get_db_session, ensure_tables_exist
        logger.info("✓ db_utils imported successfully")
        
        logger.info("Testing app import...")
        from app import app
        logger.info("✓ FastAPI app imported successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Import failed: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = test_db_import()
    if success:
        logger.info("✓ Database fix test passed")
        sys.exit(0)
    else:
        logger.error("✗ Database fix test failed")
        sys.exit(1)
