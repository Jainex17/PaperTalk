#!/usr/bin/env python3
"""
Robust startup script with comprehensive error handling and logging
"""
import os
import sys
import logging
import traceback

# Configure logging to output to stdout (Render captures this)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def check_environment():
    """Check if all required environment variables are present"""
    logger.info("=== CHECKING ENVIRONMENT VARIABLES ===")
    
    required_vars = [
        'GEMINI_API_KEY',
        'DATABASE_URL', 
        'JWT_SECRET_KEY',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'OPENROUTER_API_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        logger.error("Please set these variables in your Render dashboard")
        return False
    
    logger.info("✓ All required environment variables are present")
    return True

def load_application():
    """Load the FastAPI application with error handling"""
    logger.info("=== LOADING APPLICATION ===")
    
    try:
        # Test configuration loading first
        logger.info("Loading configuration...")
        from config.config import settings
        logger.info("✓ Configuration loaded successfully")
        
        # Test app import
        logger.info("Importing FastAPI application...")
        from app import app
        logger.info("✓ FastAPI application imported successfully")
        
        return app
        
    except Exception as e:
        logger.error(f"✗ Failed to load application: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None

def start_server(app, port):
    """Start the server with proper error handling"""
    logger.info("=== STARTING SERVER ===")
    
    try:
        import uvicorn
        
        logger.info(f"Starting server on 0.0.0.0:{port}")
        logger.info("Server should be accessible once started")
        
        # Run the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=int(port),
            log_level="info",
            access_log=True,
            loop="asyncio"
        )
        
    except Exception as e:
        logger.error(f"✗ Failed to start server: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False
    
    return True

def main():
    """Main startup function"""
    logger.info("=== PAPERTALK BACKEND STARTUP ===")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Working directory: {os.getcwd()}")
    
    # Get port from environment
    port = os.environ.get('PORT', '8000')
    logger.info(f"Port: {port}")
    
    # Check environment variables
    if not check_environment():
        logger.error("Environment check failed - exiting")
        sys.exit(1)
    
    # Load application
    app = load_application()
    if app is None:
        logger.error("Application loading failed - exiting")
        sys.exit(1)
    
    # Start server
    logger.info("=== READY TO START SERVER ===")
    logger.info("If you see this message, the application should start successfully")
    
    if not start_server(app, port):
        logger.error("Server startup failed - exiting")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal - shutting down")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        sys.exit(1)
