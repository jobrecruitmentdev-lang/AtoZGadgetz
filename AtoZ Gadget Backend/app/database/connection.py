"""
Database Connection Pool Configuration (Phase 7)
=================================================
Production-grade SQLAlchemy connection pool settings:
  - pool_size: 20 persistent connections
  - max_overflow: 40 overflow connections (60 total under peak load)
  - pool_timeout: 30 seconds wait for a connection
  - pool_recycle: 1800 seconds (30 min) — prevents stale connections
  - pool_pre_ping: True — validates connection health before use
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config.settings import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,              # Set True for SQL query logging in dev
    pool_size=20,            # Persistent connection pool size
    max_overflow=40,         # Extra connections under burst load
    pool_timeout=30,         # Seconds to wait for a connection from pool
    pool_recycle=1800,       # Recycle connections after 30 minutes
    pool_pre_ping=True,      # Ping before using (detects dropped connections)
)


@event.listens_for(engine, "connect")
def set_mysql_charset(dbapi_connection, connection_record):
    """Ensure UTF-8 charset and proper SQL mode on every new connection."""
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("SET NAMES utf8mb4")
        cursor.execute("SET CHARACTER SET utf8mb4")
        cursor.execute("SET character_set_connection=utf8mb4")
        cursor.close()
    except Exception:
        pass


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session, closes on completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
