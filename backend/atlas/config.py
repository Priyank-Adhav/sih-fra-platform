import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "postgresql://priyank@localhost:5432/atlas"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
