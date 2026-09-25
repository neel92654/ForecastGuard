"""
Unit Tests for ML Model and Confidence Evaluation.
"""

from backend.ml.model_loader import predictor
from backend.services.feature_service import FeatureService
from backend.services.confidence_service import ConfidenceService
from backend.services.reason_service import ReasonService

def test_ml_prediction_and_range():
    sample_fcst = {
        "initialization_time": "2025-08-15",
        "region": "Gujarat",
        "lead_day": 5,
        "rainfall_forecast": 84.0,
        "ensemble_spread": 8.5,
        "spatial_variability": 4.5
    }
    vec = FeatureService.extract_feature_vector(sample_fcst)
    raw_prob, cal_prob = predictor.predict_probability(vec)
    
    assert 0.0 <= raw_prob <= 1.0
    assert 0.0 <= cal_prob <= 1.0

def test_confidence_and_reasons():
    conf = ConfidenceService.calculate_confidence(bust_probability=0.78, lead_day=5, ensemble_spread=8.0)
    assert conf["level"] in ["LOW", "VERY LOW", "MEDIUM", "HIGH"]
    assert 0.0 <= conf["score"] <= 100.0
    
    factors = [
        {"feature": "rolling_rmse_7d", "importance": 0.28},
        {"feature": "ensemble_spread", "importance": 0.22},
        {"feature": "lead_day", "importance": 0.15}
    ]
    reasons = ReasonService.generate_reasons(factors, {"lead_day": 5}, bust_probability=0.78)
    assert len(reasons) >= 3
    assert all("title" in r and "description" in r and "severity" in r for r in reasons)
