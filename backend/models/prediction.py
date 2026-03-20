"""
MongoDB helper functions for Prediction documents.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase


def _smoking_label(code: int) -> str:
    mapping = {
        0: "Non smoker",
        1: "Former smoker",
        2: "Current smoker",
    }
    return mapping.get(code, "Unknown")


def _family_history_label(code: int) -> str:
    return "Yes" if code == 1 else "No"


async def save_prediction(
    db: AsyncIOMotorDatabase,
    *,
    user_id: Optional[str],
    input_data: Dict[str, Any],
    prediction_label: str,
    risk_score: Optional[float],
) -> None:
    """
    Persist a prediction document. Does not affect API response.
    """
    doc = {
        "userId": user_id,
        "age": float(input_data["age"]),
        "bmi": float(input_data["bmi"]),
        "systolicBP": float(input_data["systolic_bp"]),
        "cholesterol": float(input_data["cholesterol_mg_dl"]),
        "smokingStatus": int(input_data["smoking_status"]),
        "smokingLabel": _smoking_label(int(input_data["smoking_status"])),
        "familyHistory": int(input_data["family_history_heart_disease"]),
        "familyHistoryLabel": _family_history_label(int(input_data["family_history_heart_disease"])),
        "physicalActivity": float(input_data["physical_activity_hours_per_week"]),
        "stressLevel": float(input_data["stress_level"]),
        "riskLevel": prediction_label,
        "riskScore": float(risk_score) if risk_score is not None else None,
        "createdAt": datetime.utcnow(),
    }

    await db["predictions"].insert_one(doc)
