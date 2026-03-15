#!/usr/bin/env python3
"""
Database initialization script
Creates all tables (no auth required)
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import init_db, SessionLocal
from app.models import Workspace, User


SYSTEM_USER_EMAIL = "system@knowledgeai.local"


def ensure_system_user(db) -> User:
    """Ensure an internal system user exists (auth is disabled, but DB FKs require a user)."""
    user = db.query(User).filter(User.email == SYSTEM_USER_EMAIL).first()
    if user:
        return user

    user = User(
        email=SYSTEM_USER_EMAIL,
        hashed_password="disabled",
        full_name="System User",
        is_active=True,
        is_superuser=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print("✅ System user created")
    return user


def create_default_workspace():
    """Create a default workspace for the app."""
    db = SessionLocal()
    try:
        system_user = ensure_system_user(db)

        existing_workspace = db.query(Workspace).first()
        if existing_workspace:
            print("Default workspace already exists")
            return

        default_workspace = Workspace(
            name="Default Workspace",
            description="Default workspace for KnowledgeAI",
            owner_id=system_user.id,
        )
        db.add(default_workspace)
        db.commit()
        print("✅ Default workspace created successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Initializing KnowledgeAI database...")
    
    # Create tables
    init_db()
    
    # Create default workspace
    create_default_workspace()
    
    print("\n✅ Database initialization complete!")
