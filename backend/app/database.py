"""
Database connection module.

Provides:
- PostgreSQL connection configuration
- Database session management
- FastAPI dependency injection
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Get database URL from environment with fallback
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@localhost:5432/orderboard"
)

# Create database engine with connection pooling
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True,  # Test connections before use
    echo=False           # Set to True to see SQL queries in logs
)

# Session factory for database operations
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,    # Manual control over when to flush changes
    autocommit=False    # Require explicit commits for transactions
)

def get_db():
    """
    Database session dependency for FastAPI endpoints.
    
    Creates a new session per request and ensures proper cleanup.
    Use with FastAPI's Depends() for automatic injection.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Always clean up database connections