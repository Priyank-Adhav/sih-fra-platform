#!/usr/bin/env python3
"""
Main server launcher for FRA Claim Process Tracker
"""

import uvicorn
import os
import sys

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from app import app

if __name__ == "__main__":
    print("🚀 Starting FRA Claim Process Tracker API...")
    print("📍 Host: 0.0.0.0:8004")
    print("📚 API Documentation: http://localhost:8004/docs")
    print("❤️  Health Check: http://localhost:8004/api/claim-process/health")
    print("Press Ctrl+C to stop the server\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8004,  # Changed to 8004 to avoid conflicts
        reload=True,
        log_level="info"
    )