#!/usr/bin/env python3
"""
Startup script for Render deployment
"""
import os
import sys
import logging

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Start the application with proper port binding for Render"""
    try:
        # Get port from environment variable (Render provides this)
        port = os.environ.get('PORT', '8000')
        
        logger.info(f"Starting application on port {port}")
        logger.info("Loading application modules...")
        
        # Import the FastAPI app (this will validate environment variables)
        from app import app
        logger.info("Application loaded successfully")
        
        # Import uvicorn for running the app
        import uvicorn
        
        logger.info(f"Starting server on 0.0.0.0:{port}")
        
        # Run the application
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=int(port),
            log_level="info",
            access_log=True
        )
        
    except ImportError as e:
        logger.error(f"Failed to import application modules: {str(e)}", exc_info=True)
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to start application: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
