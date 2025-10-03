import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Use your existing database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://priyank:password@localhost:5432/fra_platform")
    DOCUMENT_SERVICE_URL: str = os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8002")
    ATLAS_SERVICE_URL: str = os.getenv("ATLAS_SERVICE_URL", "http://localhost:8001")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fra-claim-tracker-secret-2024")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")  # Add this line
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # This allows extra environment variables

settings = Settings()