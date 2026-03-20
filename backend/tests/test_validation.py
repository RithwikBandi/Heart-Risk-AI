"""
Unit tests for validation module: edge cases and invalid inputs.
"""
import pytest
from validation import validate_health_input, sanitize_and_prepare_for_model

VALID_PAYLOAD = {
    "age": 45,
    "bmi": 22.5,
    "systolic_bp": 120,
    "cholesterol_mg_dl": 180,
    "smoking_status": 0,
    "family_history_heart_disease": 0,
    "physical_activity_hours_per_week": 3.0,
    "stress_level": 5,
}


def test_valid_input_passes():
    valid, err = validate_health_input(VALID_PAYLOAD)
    assert valid is True
    assert err is None


def test_age_zero_rejected():
    data = {**VALID_PAYLOAD, "age": 0}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "age" in err.lower()


def test_age_150_rejected():
    data = {**VALID_PAYLOAD, "age": 150}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "age" in err.lower()


def test_age_18_accepted():
    data = {**VALID_PAYLOAD, "age": 18}
    valid, err = validate_health_input(data)
    assert valid is True


def test_age_85_accepted():
    data = {**VALID_PAYLOAD, "age": 85}
    valid, err = validate_health_input(data)
    assert valid is True


def test_bmi_negative_rejected():
    data = {**VALID_PAYLOAD, "bmi": -5}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "bmi" in err.lower()


def test_bmi_15_accepted():
    data = {**VALID_PAYLOAD, "bmi": 15}
    valid, err = validate_health_input(data)
    assert valid is True


def test_bmi_45_accepted():
    data = {**VALID_PAYLOAD, "bmi": 45}
    valid, err = validate_health_input(data)
    assert valid is True


def test_cholesterol_999_rejected():
    data = {**VALID_PAYLOAD, "cholesterol_mg_dl": 999}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "cholesterol" in err.lower()


def test_cholesterol_120_320_accepted():
    for val in (120, 320):
        data = {**VALID_PAYLOAD, "cholesterol_mg_dl": val}
        valid, err = validate_health_input(data)
        assert valid is True, f"cholesterol={val} should be valid: {err}"


def test_stress_20_rejected():
    data = {**VALID_PAYLOAD, "stress_level": 20}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "stress" in err.lower()


def test_stress_1_10_accepted():
    for val in (1, 10):
        data = {**VALID_PAYLOAD, "stress_level": val}
        valid, err = validate_health_input(data)
        assert valid is True, f"stress_level={val}: {err}"


def test_smoking_invalid_rejected():
    data = {**VALID_PAYLOAD, "smoking_status": 5}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "smoking" in err.lower()


def test_family_history_invalid_rejected():
    data = {**VALID_PAYLOAD, "family_history_heart_disease": 3}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "family" in err.lower()


def test_missing_field_rejected():
    data = {**VALID_PAYLOAD}
    del data["age"]
    valid, err = validate_health_input(data)
    assert valid is False
    assert "missing" in err.lower() or "age" in err.lower()


def test_not_dict_rejected():
    valid, err = validate_health_input([1, 2, 3])
    assert valid is False
    assert "object" in err.lower() or "json" in err.lower()


def test_nan_rejected():
    data = {**VALID_PAYLOAD, "age": float("nan")}
    valid, err = validate_health_input(data)
    assert valid is False


def test_inf_rejected():
    data = {**VALID_PAYLOAD, "bmi": float("inf")}
    valid, err = validate_health_input(data)
    assert valid is False


def test_null_like_values_rejected():
    data = {**VALID_PAYLOAD, "age": None}
    valid, err = validate_health_input(data)
    assert valid is False


def test_physical_activity_out_of_range_rejected():
    data = {**VALID_PAYLOAD, "physical_activity_hours_per_week": 20}
    valid, err = validate_health_input(data)
    assert valid is False
    assert "physical" in err.lower() or "activity" in err.lower()


def test_sanitize_returns_clean_dict():
    out = sanitize_and_prepare_for_model(VALID_PAYLOAD)
    assert out is not None
    assert list(out.keys()) == [
        "age", "bmi", "systolic_bp", "cholesterol_mg_dl",
        "smoking_status", "family_history_heart_disease",
        "physical_activity_hours_per_week", "stress_level",
    ]
    assert all(isinstance(v, (int, float)) for v in out.values())


def test_sanitize_invalid_returns_none():
    assert sanitize_and_prepare_for_model({**VALID_PAYLOAD, "age": 0}) is None
