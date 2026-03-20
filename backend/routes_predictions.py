"""
Prediction history routes.
These routes do NOT modify the existing /predict behavior.
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from db import get_database
from auth import get_current_user

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

def _stringify(doc: Dict[str, Any]) -> Dict[str, Any]:
    d = dict(doc)
    if "_id" in d and isinstance(d["_id"], ObjectId):
        d["_id"] = str(d["_id"])
    return d

@router.get("/history")
async def prediction_history(user: Dict[str, Any] = Depends(get_current_user)) -> List[Dict[str, Any]]:
    """
    Return prediction history for the authenticated user.
    """
    db = get_database()
    cursor = (
        db["predictions"]
        .find({"userId": str(user["_id"])})
        .sort("createdAt", -1)
        .limit(200)
    )
    docs = [_stringify(doc) async for doc in cursor]
    return docs