"""
SQLAlchemy ORM Models for ForecastGuard.
Tracks forecast runs, observations, verification outcomes, model versions, and replay logs.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from datetime import datetime
from backend.db.database import Base

class ForecastRecord(Base):
    __tablename__ = "forecast_values"

    id = Column(Integer, primary_key=True, index=True)
    forecast_id = Column(String(64), unique=True, index=True)
    initialization_time = Column(DateTime, index=True)
    valid_time = Column(DateTime, index=True)
    region = Column(String(64), index=True)
    zone = Column(String(64), nullable=True)
    latitude = Column(Float)
    longitude = Column(Float)
    lead_day = Column(Integer, index=True)
    rainfall_forecast = Column(Float)
    temperature_forecast = Column(Float)
    wind_forecast = Column(Float)
    pressure_forecast = Column(Float)
    humidity_forecast = Column(Float)
    ensemble_mean = Column(Float, nullable=True)
    ensemble_spread = Column(Float, nullable=True)
    spatial_variability = Column(Float, nullable=True)
    data_source = Column(String(64), default="DEMO DATA")
    created_at = Column(DateTime, default=datetime.utcnow)

class ObservationRecord(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    observation_id = Column(String(64), unique=True, index=True)
    valid_time = Column(DateTime, index=True)
    region = Column(String(64), index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    rainfall_observed = Column(Float)
    temperature_observed = Column(Float)
    wind_observed = Column(Float)
    pressure_observed = Column(Float)
    humidity_observed = Column(Float)
    data_source = Column(String(64), default="DEMO DATA")
    created_at = Column(DateTime, default=datetime.utcnow)

class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(Integer, primary_key=True, index=True)
    forecast_id = Column(String(64), index=True)
    region = Column(String(64), index=True)
    lead_day = Column(Integer, index=True)
    initialization_time = Column(DateTime)
    valid_time = Column(DateTime)
    forecast_value = Column(Float)
    observed_value = Column(Float)
    absolute_error = Column(Float)
    signed_error = Column(Float)
    bust_threshold = Column(Float)
    is_bust = Column(Boolean)
    bust_probability = Column(Float)
    confidence_level = Column(String(32))
    factors = Column(JSON, nullable=True)
    data_source = Column(String(64), default="DEMO DATA")
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelMetadataRecord(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(64), unique=True, index=True)
    algorithm = Column(String(64))
    calibration_method = Column(String(64))
    training_dataset = Column(String(128))
    training_date = Column(DateTime, default=datetime.utcnow)
    bust_percentile = Column(Float, default=90.0)
    evaluation_metrics = Column(JSON)
    status = Column(String(32), default="ACTIVE")

class HistoricalReplayLog(Base):
    __tablename__ = "historical_replays"

    id = Column(Integer, primary_key=True, index=True)
    replay_date = Column(DateTime, index=True)
    region = Column(String(64), index=True)
    lead_day = Column(Integer)
    forecast_value = Column(Float)
    observed_value = Column(Float)
    absolute_error = Column(Float)
    predicted_bust_probability = Column(Float)
    actual_bust = Column(Boolean)
    prediction_correct = Column(Boolean)
    data_source = Column(String(64), default="HISTORICAL REPLAY — DEMONSTRATION DATA")
    created_at = Column(DateTime, default=datetime.utcnow)
