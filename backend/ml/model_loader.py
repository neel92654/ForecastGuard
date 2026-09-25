"""
Model Loader and Lifecycle Manager for ForecastGuard.
Loads the trained calibrated XGBoost artifact, metadata, and SHAP explainer,
or provides a deterministic, transparent Baseline Fallback Mode during setup.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any, Tuple
from backend.config.settings import settings
from backend.services.feature_service import FEATURE_COLUMNS
from backend.ml.explainer import ModelExplainer

class ForecastGuardPredictor:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or settings.MODEL_PATH
        self.model = None
        self.metadata = {}
        self.explainer = None
        self.is_baseline_fallback = False
        self.load_model()

    def load_model(self):
        """Loads serialized model and metadata if available."""
        if os.path.exists(self.model_path):
            try:
                bundle = joblib.load(self.model_path)
                self.model = bundle["model"]
                self.metadata = bundle.get("metadata", {})
                self.explainer = ModelExplainer(self.model, FEATURE_COLUMNS)
                self.is_baseline_fallback = False
                print(f"[ForecastGuard] Loaded trained ML model from {self.model_path}")
                return
            except Exception as e:
                print(f"[ForecastGuard] Warning: Failed to load model from {self.model_path}: {e}")

        # Fallback Baseline Mode
        print("[ForecastGuard] Warning: Running in Baseline Demonstration Mode (Trained ML model artifact not found).")
        self.is_baseline_fallback = True
        self.metadata = {
            "model_version": "v0.1-baseline-fallback",
            "algorithm": "Deterministic Baseline Scorer",
            "calibration_method": "Heuristic Sigmoid",
            "training_dataset": "N/A",
            "training_date": "N/A",
            "status": "DEVELOPMENT_FALLBACK"
        }
        self.explainer = ModelExplainer(None, FEATURE_COLUMNS)

    def predict_probability(self, feature_df: pd.DataFrame) -> Tuple[float, float]:
        """
        Returns (raw_probability, calibrated_probability).
        """
        if self.is_baseline_fallback or self.model is None:
            # Deterministic baseline heuristic
            row = feature_df.iloc[0]
            lead = row.get("lead_day", 1)
            spread = row.get("ensemble_spread", 3.0)
            rain = row.get("rainfall_forecast", 0.0)
            rmse = row.get("rolling_rmse_7d", 5.0)
            
            # Non-linear heuristic score
            logit = -2.5 + (lead * 0.22) + (spread * 0.08) + (min(100.0, rain) * 0.015) + (rmse * 0.06)
            prob = 1.0 / (1.0 + np.exp(-logit))
            prob = float(np.clip(prob, 0.03, 0.96))
            return round(prob, 3), round(prob, 3)

        # Trained Model Inference
        X = feature_df[FEATURE_COLUMNS]
        prob = self.model.predict_proba(X)[0, 1]
        calibrated_prob = float(prob)
        
        # Raw probability from underlying estimator if available
        try:
            if hasattr(self.model, "calibrated_classifiers_") and len(self.model.calibrated_classifiers_) > 0:
                base_est = self.model.calibrated_classifiers_[0].estimator
                raw_prob = float(base_est.predict_proba(X)[0, 1])
            else:
                raw_prob = calibrated_prob
        except Exception:
            raw_prob = calibrated_prob
            
        return round(raw_prob, 3), round(calibrated_prob, 3)

    def explain(self, feature_df: pd.DataFrame, top_k: int = 4) -> list:
        """Computes SHAP factors for the prediction."""
        return self.explainer.explain_instance(feature_df[FEATURE_COLUMNS], top_k=top_k)

# Global predictor singleton
predictor = ForecastGuardPredictor()
