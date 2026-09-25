"""
Unit Tests for Forecast Verification Engine.
"""

import numpy as np
import pandas as pd
from backend.services.verification_service import VerificationService

def test_pointwise_errors():
    res = VerificationService.calculate_errors(84.0, 39.0)
    assert res["absolute_error"] == 45.0
    assert res["signed_error"] == 45.0
    assert res["relative_error"] > 0

def test_bulk_metrics():
    fcsts = np.array([10.0, 20.0, 30.0])
    obs = np.array([10.0, 25.0, 25.0])
    res = VerificationService.compute_bulk_metrics(fcsts, obs)
    assert res["mae"] == round((0 + 5 + 5) / 3, 2)
    assert res["bias"] == 0.0 # (0 - 5 + 5) / 3 = 0
    assert res["count"] == 3

def test_bust_thresholds_and_labeling():
    data = [
        {"region": "Gujarat", "lead_day": 5, "absolute_error": 5.0},
        {"region": "Gujarat", "lead_day": 5, "absolute_error": 12.0},
        {"region": "Gujarat", "lead_day": 5, "absolute_error": 15.0},
        {"region": "Gujarat", "lead_day": 5, "absolute_error": 40.0},
    ]
    df = pd.DataFrame(data)
    thresholds = VerificationService.compute_bust_thresholds(df, percentile=90.0, min_threshold_mm=10.0)
    assert len(thresholds) == 1
    assert thresholds.iloc[0]["bust_threshold"] >= 10.0
    
    labeled = VerificationService.apply_bust_labels(df, thresholds)
    assert "is_bust" in labeled.columns
    assert labeled["is_bust"].sum() >= 1
