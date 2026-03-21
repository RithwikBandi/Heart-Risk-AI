"""
Admin analytics + user management routes.
All endpoints require isAdmin=True on the authenticated user.
"""

from typing import Any, Dict, List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth import get_current_user
from db import get_database


router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _require_admin(user: Dict[str, Any]) -> None:
    """Raise 403 if the requesting user is not an admin."""
    if not bool(user.get("isAdmin")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )


def _serialize_user(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Return a safe, serialisable user dict — no password hash."""
    return {
        "_id":       str(doc["_id"]),
        "name":      doc.get("name", ""),
        "email":     doc.get("email", ""),
        "isAdmin":   bool(doc.get("isAdmin", False)),
        "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else None,
    }


# ─── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def admin_stats(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Return aggregate statistics for the admin dashboard.
    Requires isAdmin=True.
    """
    _require_admin(user)

    db = get_database()

    # Total and counts by riskLevel
    pipeline = [
        {
            "$group": {
                "_id":            "$riskLevel",
                "count":          {"$sum": 1},
                "avgAge":         {"$avg": "$age"},
                "avgCholesterol": {"$avg": "$cholesterol"},
            }
        }
    ]
    results = await db["predictions"].aggregate(pipeline).to_list(length=None)

    total_predictions = sum(r["count"] for r in results)
    risk_counts = {r["_id"]: r["count"] for r in results}

    avg_age = (
        sum(r["avgAge"] * r["count"] for r in results) / total_predictions
        if total_predictions > 0
        else None
    )
    avg_cholesterol = (
        sum(r["avgCholesterol"] * r["count"] for r in results) / total_predictions
        if total_predictions > 0
        else None
    )

    time_pipeline = [
        {
            "$group": {
                "_id":   {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    time_series = await db["predictions"].aggregate(time_pipeline).to_list(length=None)

    return {
        "totalPredictions":    int(total_predictions),
        "highRiskCount":       int(risk_counts.get("High Risk", 0)),
        "mediumRiskCount":     int(risk_counts.get("Medium Risk", 0)),
        "lowRiskCount":        int(risk_counts.get("Low Risk", 0)),
        "averageAge":          float(avg_age) if avg_age is not None else None,
        "averageCholesterol":  float(avg_cholesterol) if avg_cholesterol is not None else None,
        "predictionsOverTime": [
            {"date": r["_id"], "count": int(r["count"])} for r in time_series
        ],
    }


# ─── User Management ──────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Return all registered users (excluding password hashes).
    Requires isAdmin=True.
    """
    _require_admin(user)

    db = get_database()
    cursor = db["users"].find({}).sort("createdAt", -1)
    users: List[Dict[str, Any]] = [_serialize_user(u) async for u in cursor]

    return {
        "totalUsers": len(users),
        "users":      users,
    }


class RoleUpdateBody(BaseModel):
    isAdmin: bool


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: RoleUpdateBody,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Promote or demote a user's admin role.
    Requires isAdmin=True on the requesting user.
    An admin cannot demote themselves.
    """
    _require_admin(current_user)

    # Prevent self-demotion
    if str(current_user["_id"]) == user_id and not body.isAdmin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin privileges.",
        )

    db = get_database()

    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format.",
        )

    result = await db["users"].update_one(
        {"_id": oid},
        {"$set": {"isAdmin": body.isAdmin}},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    updated = await db["users"].find_one({"_id": oid})
    return _serialize_user(updated)
