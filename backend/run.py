#!/usr/bin/env python3
"""
Alternative startup script using Gunicorn directly
"""
import os
import sys
import subprocess

def main():
    """Start the application using Gunicorn with Uvicorn workers"""
    try:
        # Get port from environment variable
        port = os.environ.get('PORT', '8000')
        
        # Build the gunicorn command
        cmd = [
            "gunicorn",
            "app:app",
            "--bind", f"0.0.0.0:{port}",
            "--workers", "2",
            "--timeout", "120",
            "--worker-class", "uvicorn.workers.UvicornWorker",
            "--access-logfile", "-",
            "--error-logfile", "-",
            "--log-level", "info"
        ]
        
        print(f"Starting application with command: {' '.join(cmd)}")
        
        # Run the command
        subprocess.run(cmd, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"Failed to start application: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
