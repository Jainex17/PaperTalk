#!/usr/bin/env python3
"""
Debug startup script to help identify what's causing the port binding issue
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

def main():
    """Debug startup process step by step"""
    try:
        logger.info("=== DEBUG STARTUP SCRIPT ===")
        logger.info(f"Python version: {sys.version}")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Python path: {sys.path}")
        
        # Check environment variables
        logger.info("=== ENVIRONMENT VARIABLES ===")
        port = os.environ.get('PORT', '8000')
        logger.info(f"PORT: {port}")
        
        # Check for required environment variables
        required_vars = [
            'GEMINI_API_KEY',
            'DATABASE_URL', 
            'JWT_SECRET_KEY',
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'OPENROUTER_API_KEY'
        ]
        
        logger.info("=== CHECKING ENVIRONMENT VARIABLES ===")
        missing_vars = []
        for var in required_vars:
            value = os.environ.get(var)
            if value:
                logger.info(f"✓ {var}: {'*' * min(len(value), 10)}...")
            else:
                logger.error(f"✗ {var}: NOT SET")
                missing_vars.append(var)
        
        if missing_vars:
            logger.error(f"Missing required environment variables: {missing_vars}")
            logger.error("Application cannot start without these variables")
            return False
        
        logger.info("=== TESTING CONFIGURATION LOADING ===")
        try:
            from config.config import settings
            logger.info("✓ Configuration loaded successfully")
            logger.info(f"Frontend URL: {settings.FRONTEND_URL}")
            logger.info(f"Backend URL: {settings.BACKEND_URL}")
        except Exception as e:
            logger.error(f"✗ Configuration loading failed: {e}")
            return False
        
        logger.info("=== TESTING APP IMPORT ===")
        try:
            from app import app
            logger.info("✓ FastAPI app imported successfully")
        except Exception as e:
            logger.error(f"✗ App import failed: {e}")
            logger.error("This is likely the cause of the port binding issue")
            return False
        
        logger.info("=== TESTING UVIORN IMPORT ===")
        try:
            import uvicorn
            logger.info("✓ Uvicorn imported successfully")
        except Exception as e:
            logger.error(f"✗ Uvicorn import failed: {e}")
            return False
        
        logger.info("=== ALL CHECKS PASSED ===")
        logger.info("The application should be able to start properly")
        logger.info("If you're still having issues, check the Render logs for more details")
        
        return True
        
    except Exception as e:
        logger.error(f"Unexpected error during debug: {e}", exc_info=True)
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        logger.error("Debug checks failed - application will not start properly")
        sys.exit(1)
    else:
        logger.info("Debug checks passed - application should start")
        sys.exit(0)
