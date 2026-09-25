# ForecastGuard — REST API Reference

The ForecastGuard API is built on FastAPI and provides OpenAPI documentation at `/docs`.

## Base URL
`http://localhost:8000/api`

---

### 1. Health Status
`GET /api/health`
**Response:**
```json
{
  "status": "ONLINE",
  "service": "ForecastGuard",
  "model_version": "ForecastGuard-v1.0-XGBoost-Calibrated",
  "model_status": "PROTOTYPE_TRAINED",
  "data_source": "DEMO DATA",
  "demo_mode": true,
  "timestamp": "2026-09-25 18:20:00 UTC"
}
```

---

### 2. Risk Prediction
`GET /api/risk?region=Gujarat&lead_day=5&variable=rainfall`
**Response:**
```json
{
  "region": "Gujarat",
  "lead_day": 5,
  "variable": "rainfall",
  "forecast_value": 84.0,
  "bust_probability": 0.78,
  "raw_bust_probability": 0.82,
  "confidence": {
    "level": "LOW",
    "score": 48.5,
    "badge_color": "orange",
    "summary": "Low Confidence: Elevated bust risk detected. Model members diverge and precipitation timing/intensity may shift.",
    "risk_level": "VERY HIGH RISK",
    "risk_code": "VERY_HIGH",
    "risk_color": "#ef4444"
  },
  "bust_threshold": 32.5,
  "historical_mae": 8.4,
  "historical_rmse": 11.2,
  "factors": [
    {
      "code": "HIGH_HISTORICAL_ERROR",
      "title": "High Historical Error",
      "description": "Model errors in this region have spiked significantly over the past 7 days.",
      "severity": "high",
      "feature": "rolling_rmse_7d",
      "importance": 0.28
    }
  ],
  "data_source": "DEMO DATA",
  "model_version": "ForecastGuard-v1.0-XGBoost-Calibrated",
  "generated_at": "2026-09-25 18:20:00 UTC"
}
```

---

### 3. National Risk Map GeoJSON
`GET /api/risk-map?lead_day=5&variable=rainfall`
**Response:**
```json
{
  "type": "FeatureCollection",
  "lead_day": 5,
  "variable": "rainfall",
  "data_source": "DEMO DATA",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [71.1924, 22.2587] },
      "properties": {
        "region": "Gujarat",
        "lead_day": 5,
        "forecast_rainfall": 84.0,
        "bust_probability": 0.78,
        "risk_code": "VERY_HIGH",
        "risk_level": "VERY HIGH RISK",
        "risk_color": "#ef4444",
        "confidence_level": "LOW",
        "confidence_score": 48.5
      }
    }
  ]
}
```

---

### 4. Regional 10-Day Profile
`GET /api/forecast/profile?region=Gujarat&variable=rainfall`

---

### 5. Historical Replay
`POST /api/historical-replay`
**Request Body:**
```json
{
  "date": "2025-08-15",
  "region": "Gujarat",
  "lead_day": 5
}
```
**Response:**
```json
{
  "date": "2025-08-15",
  "region": "Gujarat",
  "lead_day": 5,
  "forecast_value": 84.0,
  "observed_value": 39.0,
  "absolute_error": 45.0,
  "signed_error": 45.0,
  "bust_threshold": 32.5,
  "predicted_bust_probability": 0.81,
  "predicted_bust_decision": true,
  "actual_bust": true,
  "prediction_correct": true,
  "confidence": { ... },
  "factors": [ ... ],
  "data_source": "HISTORICAL REPLAY — DEMONSTRATION DATA"
}
```

---

### 6. Model Verification & Metrics
`GET /api/model/metrics` and `GET /api/verification`
