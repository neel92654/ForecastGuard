"""
Unit Tests for Feature Engineering Engine.
"""

import pandas as pd
from backend.services.feature_service import FeatureService, FEATURE_COLUMNS

def test_extract_feature_vector():
    sample_fcst = {
        "initialization_time": "2025-08-15",
        "region": "Gujarat",
        "lead_day": 5,
        "rainfall_forecast": 84.0,
        "temperature_forecast": 29.0,
        "wind_forecast": 14.0,
        "pressure_forecast": 1004.0,
        "humidity_forecast": 82.0,
        "ensemble_spread": 8.5,
        "ensemble_mean": 80.0,
        "spatial_variability": 4.5
    }
    vec = FeatureService.extract_feature_vector(sample_fcst)
    assert list(vec.columns) == FEATURE_COLUMNS
    assert len(vec) == 1
    assert vec["lead_day"].iloc[0] == 5
    assert vec["rainfall_forecast"].iloc[0] == 84.0
    assert vec["is_monsoon"].iloc[0] == 1 # August is monsoon
