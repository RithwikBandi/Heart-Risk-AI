# ==========================================
# Feature Label Mapping
# ==========================================

feature_labels = {
    "age": "Age",
    "bmi": "Body Mass Index (BMI)",
    "systolic_bp": "Systolic Blood Pressure",
    "cholesterol_mg_dl": "Cholesterol Level",
    "smoking_status": "Smoking Habit",
    "family_history_heart_disease": "Family History of Heart Disease",
    "physical_activity_hours_per_week": "Physical Activity Level",
    "stress_level": "Stress Level",
}


# ==========================================
# Medical Thresholds (clinical rules)
# ==========================================

# BMI: Normal 18.5–24.9, Overweight >25
BMI_NORMAL_LOW = 18.5
BMI_NORMAL_HIGH = 24.9
BMI_OVERWEIGHT = 25.0

# Blood pressure: Normal <120, High ≥140 (mmHg)
BP_NORMAL = 120
BP_HIGH = 140

# Cholesterol: Optimal <200, High ≥240 (mg/dL)
CHOL_OPTIMAL = 200
CHOL_HIGH = 240

# Physical activity: Healthy ≥3 hours/week
ACTIVITY_HEALTHY = 3.0

# Stress level: High stress ≥8 (1–10 scale)
STRESS_HIGH = 8


# ==========================================
# SHAP contribution helper
# ==========================================

def _get_shap_contributions(sample, shap_values, prediction_class):
    """
    Returns list of (feature_name, contribution) for the predicted class,
    sorted by absolute contribution descending. Contribution > 0 pushes toward
    this class (increases risk); < 0 reduces it.
    """
    # Handle both (n_samples, n_features, n_classes) and (n_samples, n_features)
    vals = shap_values.values
    if vals.ndim == 3:
        contributions = vals[0][:, prediction_class]
    else:
        contributions = vals[0]
    feature_names = list(sample.columns)
    out = [(feature_names[i], float(contributions[i])) for i in range(len(feature_names))]
    out.sort(key=lambda x: abs(x[1]), reverse=True)
    return out


# ==========================================
# Key factors (top 3–4 by SHAP for this prediction)
# ==========================================

def shap_feature_impact(sample, shap_values, prediction_class):
    contributions = _get_shap_contributions(sample, shap_values, prediction_class)
    key_factors = []
    for feature_name, _ in contributions[:4]:
        label = feature_labels.get(feature_name, feature_name)
        key_factors.append(label)
    return key_factors


# ==========================================
# Dynamic health analysis (SHAP + patient values)
# ==========================================

def _get_sample_values(sample):
    """Extract single-row values as a dict for easier use."""
    return {col: sample[col].values[0] for col in sample.columns}


def analyze_health(sample, shap_values, prediction_class):
    """
    Builds health_analysis and protective_factors from both SHAP contributions
    and actual patient values. Explanations are dynamic and clinical.
    """
    analysis = []
    protective = []
    contribs = _get_shap_contributions(sample, shap_values, prediction_class)
    contrib_by_feature = {f: c for f, c in contribs}
    values = _get_sample_values(sample)

    age = values.get("age")
    bmi = values.get("bmi")
    bp = values.get("systolic_bp")
    chol = values.get("cholesterol_mg_dl")
    stress = values.get("stress_level")
    activity = values.get("physical_activity_hours_per_week")
    smoking = values.get("smoking_status")
    family_hx = values.get("family_history_heart_disease")

    # --- Age ---
    age_contrib = contrib_by_feature.get("age", 0)
    if age is not None:
        if age > 60 and age_contrib > 0:
            analysis.append(
                "Advanced age is a significant contributor to cardiovascular risk in this assessment."
            )
        elif age <= 60 and age_contrib < 0:
            protective.append("Younger age is associated with lower cardiovascular risk in this profile.")

    # --- BMI ---
    bmi_contrib = contrib_by_feature.get("bmi", 0)
    if bmi is not None:
        if bmi > BMI_OVERWEIGHT and bmi_contrib > 0:
            analysis.append(
                "Elevated body mass index contributes to cardiovascular risk and may increase cardiac strain."
            )
        elif BMI_NORMAL_LOW <= bmi <= BMI_NORMAL_HIGH:
            protective.append("Body mass index is within the healthy recommended range.")

    # --- Blood pressure ---
    bp_contrib = contrib_by_feature.get("systolic_bp", 0)
    if bp is not None:
        if bp >= BP_HIGH and bp_contrib > 0:
            analysis.append(
                "Elevated systolic blood pressure is a major contributor to cardiovascular risk and warrants attention."
            )
        elif bp < BP_NORMAL and bp_contrib <= 0:
            protective.append("Blood pressure remains within a healthy range and supports cardiovascular stability.")
        elif bp < BP_NORMAL:
            protective.append("Blood pressure is within the normal range.")

    # --- Cholesterol ---
    chol_contrib = contrib_by_feature.get("cholesterol_mg_dl", 0)
    if chol is not None:
        if chol >= CHOL_HIGH and chol_contrib > 0:
            analysis.append(
                "Elevated cholesterol levels are a major contributor to cardiovascular risk and arterial health."
            )
        elif chol >= CHOL_OPTIMAL and chol < CHOL_HIGH and chol_contrib > 0:
            analysis.append(
                "Cholesterol level is above optimal and contributes to cardiovascular risk in this assessment."
            )
        elif chol < CHOL_OPTIMAL and chol_contrib < 0:
            protective.append("Cholesterol level is within an optimal range, which is favorable for heart health.")

    # --- Smoking ---
    smoke_contrib = contrib_by_feature.get("smoking_status", 0)
    if smoking is not None:
        if smoking == 2 and smoke_contrib > 0:  # current smoker
            analysis.append(
                "Current smoking is a significant modifiable risk factor for cardiovascular disease."
            )
        elif smoking == 0 and smoke_contrib < 0:
            protective.append("Non-smoking status is protective for cardiovascular health.")

    # --- Family history ---
    fam_contrib = contrib_by_feature.get("family_history_heart_disease", 0)
    if family_hx is not None and family_hx == 1 and fam_contrib > 0:
        analysis.append(
            "Family history of heart disease is an important non-modifiable risk factor in this assessment."
        )

    # --- Physical activity ---
    act_contrib = contrib_by_feature.get("physical_activity_hours_per_week", 0)
    if activity is not None:
        if activity >= ACTIVITY_HEALTHY:
            protective.append("Regular physical activity helps support cardiovascular health.")
        elif activity < ACTIVITY_HEALTHY and act_contrib > 0:
            analysis.append(
                "Low physical activity level contributes to cardiovascular risk; increased activity is beneficial."
            )

    # --- Stress ---
    stress_contrib = contrib_by_feature.get("stress_level", 0)
    if stress is not None:
        if stress >= STRESS_HIGH and stress_contrib > 0:
            analysis.append(
                "High stress levels may negatively impact cardiovascular health and are a contributing factor."
            )
        elif stress < STRESS_HIGH and stress_contrib < 0:
            protective.append("Stress level is within a range that is less likely to adversely affect heart health.")

    # If no analysis was added from SHAP+values, add a neutral line
    if not analysis and prediction_class > 0:
        analysis.append("Several factors together contribute to the assessed cardiovascular risk level.")

    return analysis, protective


# ==========================================
# Recommendation engine (risk + abnormal values + SHAP)
# ==========================================

def generate_recommendations(sample, prediction_label, shap_contributions):
    """
    Recommendations depend on prediction risk level, abnormal values,
    and SHAP importance (prioritize high-impact, modifiable factors).
    """
    recommendations = []
    values = _get_sample_values(sample)
    # Sort by absolute contribution so we can prioritize recommendations
    contrib_by_abs = {f: abs(c) for f, c in shap_contributions}
    bmi = values.get("bmi")
    chol = values.get("cholesterol_mg_dl")
    bp = values.get("systolic_bp")
    activity = values.get("physical_activity_hours_per_week")
    smoking = values.get("smoking_status")
    stress = values.get("stress_level")

    if prediction_label == "High Risk":
        recommendations.append(
            "Multiple cardiovascular risk factors are present. A detailed medical evaluation with a healthcare professional is strongly recommended."
        )

    # Cholesterol: high SHAP + elevated/high value → recommend first
    if chol is not None and chol >= CHOL_OPTIMAL and contrib_by_abs.get("cholesterol_mg_dl", 0) > 0:
        if chol >= CHOL_HIGH:
            recommendations.append(
                "Reduce dietary cholesterol and saturated fat intake. Increasing fiber and discussing lipid-lowering options with your doctor may help."
            )
        else:
            recommendations.append(
                "Consider dietary changes to keep cholesterol in the optimal range: limit saturated fats and increase fiber."
            )

    # Blood pressure
    if bp is not None and bp >= BP_HIGH and contrib_by_abs.get("systolic_bp", 0) > 0:
        recommendations.append(
            "Monitor blood pressure regularly and reduce sodium intake. Discuss blood pressure management with your healthcare provider."
        )

    # BMI
    if bmi is not None and bmi > BMI_OVERWEIGHT and contrib_by_abs.get("bmi", 0) > 0:
        recommendations.append(
            "A balanced diet and regular physical activity can help achieve and maintain a healthy body weight and reduce cardiovascular strain."
        )

    # Physical activity
    if activity is not None and activity < ACTIVITY_HEALTHY and contrib_by_abs.get("physical_activity_hours_per_week", 0) > 0:
        recommendations.append(
            "Aim for at least 150 minutes of moderate physical activity per week to support cardiovascular health."
        )

    # Smoking
    if smoking is not None and smoking == 2:
        recommendations.append(
            "Smoking significantly increases cardiovascular risk. Smoking cessation programs and support can greatly improve heart health."
        )

    # Stress (using high stress ≥8)
    if stress is not None and stress >= STRESS_HIGH and contrib_by_abs.get("stress_level", 0) > 0:
        recommendations.append(
            "Managing stress through relaxation techniques, regular exercise, or mindfulness may benefit cardiovascular health."
        )

    if not recommendations:
        recommendations.append(
            "Your health indicators are within recommended ranges. Maintaining your current healthy lifestyle is encouraged."
        )

    return recommendations


# ==========================================
# Full explanation pipeline
# ==========================================

def generate_full_explanation(sample, shap_values, prediction_class, prediction_label):
    """
    Computes SHAP-based contributions for this prediction, then builds
    key_factors, health_analysis, protective_factors, and recommendations.
    All explanations are dynamic and based on this individual's SHAP values and data.
    Returns fallback lists if shap_values is None (e.g. SHAP failed).
    """
    if shap_values is None:
        return [], [], [], ["Explanation temporarily unavailable. Prediction result is still valid."]
    shap_contributions = _get_shap_contributions(sample, shap_values, prediction_class)

    key_factors = shap_feature_impact(sample, shap_values, prediction_class)
    analysis, protective = analyze_health(sample, shap_values, prediction_class)
    recommendations = generate_recommendations(sample, prediction_label, shap_contributions)

    return key_factors, analysis, protective, recommendations
