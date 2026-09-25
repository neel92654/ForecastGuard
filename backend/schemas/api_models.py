"""
Pydantic API Schemas for ForecastGuard.
Ensures strict validation, documentation, and serialization for all endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RegionInfo(BaseModel):
    name: str
    lat: float
    lon: float
    zone: str
    climate: str
    base_rain: float

class HealthResponse(BaseModel):
    status: str = "ONLINE"
    service: str = "ForecastGuard"
    model_version: str
    model_status: str
    data_source: str
    demo_mode: bool
    timestamp: str

class ForecastValueItem(BaseModel):
    forecast_id: str
    initialization_time: str
    valid_time: str
    region: str
    lead_day: int
    rainfall_forecast: float
    temperature_forecast: float
    wind_forecast: float
    pressure_forecast: float
    humidity_forecast: float
    ensemble_spread: float
    ensemble_mean: float
    spatial_variability: float
    data_source: str = "DEMO DATA"

class ReasonItem(BaseModel):
    code: str
    title: str
    description: str
    severity: str
    feature: Optional[str] = None
    importance: Optional[float] = None
    feature_value: Optional[Any] = None

class ConfidenceInfo(BaseModel):
    level: str
    score: float
    badge_color: str
    summary: str
    risk_level: str
    risk_code: str
    risk_color: str

class RiskPredictionResponse(BaseModel):
    region: str
    lead_day: int
    variable: str = "rainfall"
    forecast_value: float
    bust_probability: float
    raw_bust_probability: float
    confidence: ConfidenceInfo
    bust_threshold: float
    historical_mae: float
    historical_rmse: float
    factors: List[ReasonItem]
    data_source: str = "DEMO DATA"
    model_version: str
    generated_at: str

class GeoJsonFeature(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class RiskMapResponse(BaseModel):
    type: str = "FeatureCollection"
    lead_day: int
    variable: str = "rainfall"
    data_source: str
    features: List[GeoJsonFeature]

class HistoricalReplayRequest(BaseModel):
    date: str = Field(description="Historical date in YYYY-MM-DD")
    region: str = Field(description="Indian Region name, e.g. Gujarat")
    lead_day: int = Field(ge=1, le=10, description="Lead day from 1 to 10")

class HistoricalReplayResponse(BaseModel):
    date: str
    region: str
    lead_day: int
    variable: str = "rainfall"
    forecast_value: float
    observed_value: float
    absolute_error: float
    signed_error: float
    bust_threshold: float
    predicted_bust_probability: float
    predicted_bust_decision: bool
    actual_bust: bool
    prediction_correct: bool
    confidence: ConfidenceInfo
    factors: List[ReasonItem]
    data_source: str = "HISTORICAL REPLAY — DEMONSTRATION DATA"

class LeadDayProfileItem(BaseModel):
    lead_day: int
    forecast_rainfall: float
    bust_probability: float
    confidence_score: float
    confidence_level: str
    risk_code: str
    risk_color: str
    bust_threshold: float
    historical_mae: float

class RegionalProfileResponse(BaseModel):
    region: str
    variable: str = "rainfall"
    data_source: str
    lead_profile: List[LeadDayProfileItem]
