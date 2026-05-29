"""Initialize database tables directly."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = "/workspaces/chiripal/backend/squash_excellence.db"
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
Base = declarative_base()

from app.models.user import User
from app.models.tournament import Tournament
from app.models.athlete import Athlete
from app.models.finance import Budget, Transaction
from app.models.stakeholder import Stakeholder, Touchpoint
from app.models.marketing import ContentAsset, SocialPost

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ All tables created!")

Session = sessionmaker(bind=engine)
db = Session()

import bcrypt

existing = db.query(User).filter(User.email == "admin@squash-excellence.com").first()
if existing:
    print("✅ Default user already exists")
else:
    password = b"squash2026"
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    user = User(
        email="admin@squash-excellence.com",
        full_name="Program Manager",
        role="admin",
        hashed_password=hashed.decode('utf-8')
    )
    db.add(user)
    db.commit()
    print("✅ Default user created: admin@squash-excellence.com / squash2026")

db.close()