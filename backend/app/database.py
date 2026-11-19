import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

# Ensure storage directory exists
storage_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage"))
os.makedirs(storage_dir, exist_ok=True)

# For SQLite, handle path properly
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///./"):
    abs_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", db_url.replace("sqlite:///./", "")))
    connect_args = {"check_same_thread": False}
    engine = create_engine(f"sqlite:///{abs_db_path}", connect_args=connect_args)
else:
    engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
