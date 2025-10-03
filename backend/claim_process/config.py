import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.dirname(__file__)

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/fra_platform"
    DOCUMENT_SERVICE_URL: str = "http://localhost:8002"
    ATLAS_SERVICE_URL: str = "http://localhost:8001"
    SECRET_KEY: str = "fra-claim-tracker-secret-2024"
    UPLOAD_DIR: str = "./uploads"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = os.path.join(BASE_DIR, ".env")
        extra = "ignore"

settings = Settings()
print("Loaded config:", settings.model_dump())
