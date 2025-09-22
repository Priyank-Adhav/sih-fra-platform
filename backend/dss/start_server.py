#!/usr/bin/env python3
"""
Startup script for DSS Engine API
"""
import uvicorn
import os
import sys

def start_server():
    """Start the FastAPI server"""
    print("Starting DSS Engine API Server...")
    print("=" * 40)
    print("API Documentation: http://localhost:8000/docs")
    print("API Base URL: http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    print("=" * 40)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
