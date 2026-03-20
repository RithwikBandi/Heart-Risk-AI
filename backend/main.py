# ==========================================
# Import Libraries
# ==========================================

from fastapi import FastAPI, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from db import connect_to_mongo, close_mongo_connection, get_database
from validation import validate_health_input
from model_loader import predict
from explain import generate_full_explanation
from models.prediction import save_prediction
from models.model_log import log_model_inference
from auth import get_current_user_optional
from routes_auth import router as auth_router
from routes_predictions import router as predictions_router
from routes_admin import router as admin_router


# ==========================================
# Create FastAPI App
# ==========================================

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow localhost and ngrok/public URLs
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(predictions_router)
app.include_router(admin_router)


# ==========================================
# Input Data Schema
# ==========================================

class HealthInput(BaseModel):
    age: float
    bmi: float
    systolic_bp: float
    cholesterol_mg_dl: float
    smoking_status: int
    family_history_heart_disease: int
    physical_activity_hours_per_week: float
    stress_level: float


# ==========================================
# Risk Labels
# ==========================================

risk_labels = ["Low Risk", "Medium Risk", "High Risk"]

FALLBACK_EXPLANATION_MESSAGE = (
    "Explanation temporarily unavailable. Prediction result is still valid."
)


# ==========================================
# Lifespan: MongoDB connection
# ==========================================


@app.on_event("startup")
async def _startup() -> None:
    # Initialize MongoDB connection (no-op if already connected)
    await connect_to_mongo()


@app.on_event("shutdown")
async def _shutdown() -> None:
    # Cleanly close MongoDB connection
    await close_mongo_connection()


# ==========================================
# Prediction API
# ==========================================


@app.options("/predict")
def predict_options():
    return Response()


@app.post("/predict")
async def predict_risk(
    data: HealthInput,
    current_user=Depends(get_current_user_optional),
):
    input_data = data.model_dump()

    # Server-side validation (reject out-of-range, NaN, missing, etc.)
    valid, error_message = validate_health_input(input_data)
    if not valid:
        return JSONResponse(
            status_code=422,
            content={"error": error_message},
        )

    try:
        prediction, shap_values, sample_df = predict(input_data)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Prediction failed. Please try again or contact support.",
                "detail": str(e) if str(e) else "Model or SHAP error.",
            },
        )

    prediction_class = int(prediction)
    if prediction_class not in (0, 1, 2):
        return JSONResponse(
            status_code=500,
            content={"error": "Invalid prediction result from model."},
        )

    prediction_label = risk_labels[prediction_class]

    # SHAP or explanation failed: return prediction with fallback message
    if shap_values is None:
        key_factors = []
        analysis = []
        protective = []
        recommendations = [FALLBACK_EXPLANATION_MESSAGE]
    else:
        try:
            key_factors, analysis, protective, recommendations = generate_full_explanation(
                sample_df,
                shap_values,
                prediction_class,
                prediction_label,
            )
        except Exception:
            key_factors = []
            analysis = []
            protective = []
            recommendations = [FALLBACK_EXPLANATION_MESSAGE]

    response = {
        "prediction": prediction_label,
        "key_factors": key_factors,
        "health_analysis": analysis,
        "protective_factors": protective,
        "recommended_actions": recommendations,
    }

    # Fire-and-forget persistence: do not change response contract.
    try:
        db = get_database()
        user_id_str = str(current_user["_id"]) if current_user and "_id" in current_user else None
        # Risk score / confidence are optional; left as None for now or could be derived from model.
        await save_prediction(
            db,
            user_id=user_id_str,
            input_data=input_data,
            prediction_label=prediction_label,
            risk_score=None,
        )
        await log_model_inference(
            db,
            inputs=input_data,
            prediction_label=prediction_label,
            confidence=None,
        )
    except Exception:
        # Persistence must never break prediction response.
        pass

    return response

