from .database import Base, engine, SessionLocal
from .tournament import Tournament
from .athlete import Athlete
from .finance import Budget, Transaction
from .stakeholder import Stakeholder, Touchpoint
from .marketing import ContentAsset, SocialPost
from .user import User

# Create all tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
