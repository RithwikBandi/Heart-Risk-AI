"""
MongoDB helper functions for User documents and password hashing.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
import bcrypt


async def create_user(db: AsyncIOMotorDatabase, *, name: str, email: str, password: str, is_admin: bool = False) -> Dict[str, Any]:
    """
    Create a new user with a bcrypt-hashed password.
    """
    existing = await db["users"].find_one({"email": email.lower()})
    if existing:
        raise ValueError("A user with this email already exists.")

    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    doc = {
        "name": name,
        "email": email.lower(),
        "passwordHash": password_hash,
        "isAdmin": bool(is_admin),
        "createdAt": datetime.utcnow(),
    }
    result = await db["users"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def authenticate_user(db: AsyncIOMotorDatabase, *, email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Return user document if credentials are valid, otherwise None.
    """
    user = await db["users"].find_one({"email": email.lower()})
    if not user:
        return None
    stored_hash = user.get("passwordHash")
    if not stored_hash:
        return None
    if not bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
        return None
    return user

