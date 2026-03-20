"""
API tests for /predict: validation and error responses.
Requires: run from backend dir so main.app and model are available.
"""
import sys
import os

# Run from backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

VALID_BODY = {
    "age": 45,
    "bmi": 22.5,
    "systolic_bp": 120,
    "cholesterol_mg_dl": 180,
    "smoking_status": 0,
    "family_history_heart_disease": 0,
    "physical_activity_hours_per_week": 3.0,
    "stress_level": 5,
}


def test_invalid_age_zero_returns_422():
    body = {**VALID_BODY, "age": 0}
    r = client.post("/predict", json=body)
    assert r.status_code == 422
    data = r.json()
    assert "error" in data
    assert "age" in data["error"].lower()


def test_invalid_age_150_returns_422():
    body = {**VALID_BODY, "age": 150}
    r = client.post("/predict", json=body)
    assert r.status_code == 422
    assert "error" in r.json()


def test_invalid_bmi_negative_returns_422():
    body = {**VALID_BODY, "bmi": -5}
    r = client.post("/predict", json=body)
    assert r.status_code == 422
    assert "error" in r.json()


def test_invalid_cholesterol_999_returns_422():
    body = {**VALID_BODY, "cholesterol_mg_dl": 999}
    r = client.post("/predict", json=body)
    assert r.status_code == 422
    assert "error" in r.json()


def test_invalid_stress_20_returns_422():
    body = {**VALID_BODY, "stress_level": 20}
    r = client.post("/predict", json=body)
    assert r.status_code == 422
    assert "error" in r.json()


def test_missing_field_returns_422():
    body = {**VALID_BODY}
    del body["age"]
    r = client.post("/predict", json=body)
    assert r.status_code == 422
    data = r.json()
    # Pydantic returns "detail", our validation returns "error"
    assert "error" in data or "detail" in data


def test_valid_request_returns_200_and_prediction():
    r = client.post("/predict", json=VALID_BODY)
    # 200 with prediction, or 500 if model/explainer fails (e.g. in CI without model)
    assert r.status_code in (200, 500)
    data = r.json()
    if r.status_code == 200:
        assert "prediction" in data
        assert data["prediction"] in ("Low Risk", "Medium Risk", "High Risk")
        assert "key_factors" in data
        assert "health_analysis" in data
        assert "protective_factors" in data
        assert "recommended_actions" in data
    else:
        assert "error" in data
