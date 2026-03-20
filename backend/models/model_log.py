"""
MongoDB helper functions for model inference logging.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase


async def log_model_inference(
    db: AsyncIOMotorDatabase,
    *,
    inputs: Dict[str, Any],
    prediction_label: str,
    confidence: Optional[float],
) -> None:
    """
    Store a lightweight log of model inputs and outputs for ML analysis.
    """
    doc = {
        "inputs": inputs,
        "prediction": prediction_label,
        "confidence": float(confidence) if confidence is not None else None,
        "timestamp": datetime.utcnow(),
    }
    await db["modelLogs"].insert_one(doc)

