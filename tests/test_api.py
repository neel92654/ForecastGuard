"""
Integration Tests for FastAPI Endpoints and Validation Scenarios.
"""

from fastapi.testclient import TestClient
from backend.main import app
from backend.config.settings import settings

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["service"] == "ForecastGuard"
    assert data["demo_mode"] is True
    assert "DEMO" in data["data_source"]

def test_regions_endpoint():
    response = client.get("/api/regions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 15
    assert any(r["name"] == "Gujarat" for r in data)
    assert any(r["name"] == "Odisha" for r in data)
    assert any(r["name"] == "Kerala" for r in data)

def test_risk_endpoint_valid():
    response = client.get("/api/risk?region=Gujarat&lead_day=5")
    assert response.status_code == 200
    data = response.json()
    assert data["region"] == "Gujarat"
    assert data["lead_day"] == 5
    assert 0.0 <= data["bust_probability"] <= 1.0
    assert 0.0 <= data["raw_bust_probability"] <= 1.0
    assert "confidence" in data
    assert "score" in data["confidence"]
    assert "factors" in data
    assert len(data["factors"]) >= 1

def test_risk_endpoint_invalid_lead_day():
    # Lead day must be between 1 and 10
    response = client.get("/api/risk?region=Gujarat&lead_day=15")
    assert response.status_code == 422

def test_risk_endpoint_unknown_region_graceful_fallback():
    response = client.get("/api/risk?region=NonExistentRegion&lead_day=3")
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["bust_probability"] <= 1.0
    assert "confidence" in data

def test_risk_map_endpoint():
    response = client.get("/api/risk-map?lead_day=5")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 15
    for feat in data["features"]:
      assert "geometry" in feat
      assert "properties" in feat
      assert "bust_probability" in feat["properties"]
      assert "risk_color" in feat["properties"]

def test_forecast_profile():
    response = client.get("/api/forecast/profile?region=Gujarat")
    assert response.status_code == 200
    data = response.json()
    assert len(data["lead_profile"]) == 10
    for item in data["lead_profile"]:
        assert 1 <= item["lead_day"] <= 10
        assert 0.0 <= item["bust_probability"] <= 1.0

def test_verification_endpoint():
    response = client.get("/api/verification")
    assert response.status_code == 200
    data = response.json()
    assert "overall_verification" in data
    assert "lead_day_summary" in data

def test_model_metrics_endpoint():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "primary_model_metrics" in data
    prim = data["primary_model_metrics"]
    assert "accuracy" in prim
    assert "precision" in prim
    assert "recall" in prim
    assert "brier_score" in prim
    assert "calibration_curve" in prim

def test_historical_replay():
    payload = {
        "date": "2025-08-15",
        "region": "Gujarat",
        "lead_day": 5
    }
    response = client.post("/api/historical-replay", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "forecast_value" in data
    assert "observed_value" in data
    assert "absolute_error" in data
    assert "predicted_bust_probability" in data
    assert "actual_bust" in data
    assert "prediction_correct" in data
    assert isinstance(data["actual_bust"], bool)
    assert isinstance(data["prediction_correct"], bool)

def test_no_api_key_required():
    # Verify settings run cleanly without external API keys in demo mode
    assert settings.DEMO_MODE is True
    assert settings.DATA_PROVIDER == "demo"
