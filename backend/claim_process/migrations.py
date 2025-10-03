import sys
import os
import sqlalchemy

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from .database import engine, Base
    from .models import ClaimCase, StepInstance, Document, Stakeholder, ActionLog
except ImportError:
    from database import engine, Base
    from models import ClaimCase, StepInstance, Document, Stakeholder, ActionLog

def create_tables():
    """Create all tables in the database"""
    print("Creating claim process tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Claim process tables created successfully!")

if __name__ == "__main__":
    create_tables()