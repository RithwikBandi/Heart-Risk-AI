"""
Admin analytics routes.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from db import get_database
from auth import get_current_user


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def admin_stats(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Return aggregate statistics for the admin dashboard.
    Requires the requesting user to have isAdmin=True.
    """
    if not bool(user.get("isAdmin")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")

    db = get_database()

    # Total and counts by riskLevel
    pipeline = [
        {
            "$group": {
                "_id": "$riskLevel",
                "count": {"$sum": 1},
                "avgAge": {"$avg": "$age"},
                "avgCholesterol": {"$avg": "$cholesterol"},
            }
        }
    ]
    results = await db["predictions"].aggregate(pipeline).to_list(length=None)

    total_predictions = sum(r["count"] for r in results)
    risk_counts = {r["_id"]: r["count"] for r in results}

    # Simple averages across all predictions
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

    # Predictions over time (daily counts)
    time_pipeline = [
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    time_series = await db["predictions"].aggregate(time_pipeline).to_list(length=None)

    return {
        "totalPredictions": int(total_predictions),
        "highRiskCount": int(risk_counts.get("High Risk", 0)),
        "mediumRiskCount": int(risk_counts.get("Medium Risk", 0)),
        "lowRiskCount": int(risk_counts.get("Low Risk", 0)),
        "averageAge": float(avg_age) if avg_age is not None else None,
        "averageCholesterol": float(avg_cholesterol) if avg_cholesterol is not None else None,
        "predictionsOverTime": [
            {"date": r["_id"], "count": int(r["count"])} for r in time_series
        ],
    }

