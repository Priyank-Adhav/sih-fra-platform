from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_application() -> FastAPI:
    application = FastAPI(
        title="FRA Claim Process Tracker API",
        description="Backend API for managing FRA claim workflow and process tracking",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify your frontend URLs
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Import inside function to avoid circular imports
    from .config import settings
    from .routes import router as claim_router
    from .database import engine
    from . import models

    # Create tables on startup using lifespan (modern approach)
    @application.on_event("startup")
    def startup_event():
        models.Base.metadata.create_all(bind=engine)
        
        # Initialize mock data in development
        if os.getenv("ENVIRONMENT") == "development":
            from .mock_data import initialize_mock_data
            from .database import SessionLocal
            db = SessionLocal()
            try:
                initialize_mock_data(db)
                print("✅ Mock data initialized successfully!")
            except Exception as e:
                print(f"⚠️  Could not initialize mock data: {e}")
            finally:
                db.close()

    # Include routers
    application.include_router(claim_router)

    # Mount uploads directory for serving files
    if os.path.exists(settings.UPLOAD_DIR):
        application.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

    # Health check
    @application.get("/")
    async def root():
        return {
            "message": "FRA Claim Process Tracker API",
            "status": "running",
            "version": "1.0.0"
        }

    return application

app = create_application()

# Remove the __main__ block since we're using -m