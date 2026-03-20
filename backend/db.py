"""
MongoDB connection management using Motor (async driver).

This module exposes:
- get_database(): access the shared application database
- connect_to_mongo() / close_mongo_connection(): startup/shutdown hooks

The connection string is taken from the MONGO_URI environment variable.
If not provided, it falls back to a local development URI.
"""

import os
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/heart_risk_ai")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "heart_risk_ai")

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    """
    Initialize the global Motor client and database.
    Called from FastAPI startup event.
    """
    global _client, _db
    if _client is not None:
        return

    _client = AsyncIOMotorClient(MONGO_URI)
    _db = _client[MONGO_DB_NAME]


async def close_mongo_connection() -> None:
    """
    Cleanly close the Mongo client.
    Called from FastAPI shutdown event.
    """
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_database() -> AsyncIOMotorDatabase:
    """
    Return the shared application database.
    Raises RuntimeError if called before connect_to_mongo().
    """
    if _db is None:
        raise RuntimeError("MongoDB has not been initialized. Call connect_to_mongo() first.")
    return _db

