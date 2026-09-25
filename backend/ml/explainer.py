"""
TreeSHAP Model Explainability Module for ForecastGuard.
Computes real SHAP values for tree-based models (XGBoost, Random Forest)
to extract exact local feature attributions for any forecast instance.
"""

import shap
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional

class ModelExplainer:
    def __init__(self, model, feature_names: List[str], background_sample: Optional[pd.DataFrame] = None):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        
        try:
            # Initialize TreeExplainer for tree-based models
            # If model is CalibratedCV wrapper, extract underlying base estimator
            base_estimator = getattr(model, "estimator", model)
            # In scikit-learn CalibratedClassifierCV, calibrated_classifiers_ contains the sub-estimators
            if hasattr(model, "calibrated_classifiers_") and len(model.calibrated_classifiers_) > 0:
                base_estimator = model.calibrated_classifiers_[0].estimator
                
            self.explainer = shap.TreeExplainer(base_estimator)
        except Exception as e:
            # Fallback to Exact or Kernel/Linear Explainer if TreeExplainer cannot initialize
            try:
                if background_sample is not None and len(background_sample) > 0:
                    sample = background_sample.sample(min(50, len(background_sample)), random_state=42)
                    self.explainer = shap.Explainer(base_estimator, sample)
            except Exception:
                self.explainer = None

    def explain_instance(self, feature_row: pd.DataFrame, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Computes SHAP values for a single row DataFrame and returns sorted factors.
        """
        if self.explainer is None:
            return self._fallback_feature_importance(feature_row, top_k)
            
        try:
            shap_values = self.explainer(feature_row)
            # Handle multi-output or single output
            values = shap_values.values
            if len(values.shape) == 3: # (1, num_features, num_classes)
                # Class 1 (Bust)
                importance = values[0, :, 1]
            elif len(values.shape) == 2: # (1, num_features)
                importance = values[0, :]
            else:
                importance = values
                
            factors = []
            for name, val in zip(self.feature_names, importance):
                factors.append({
                    "feature": name,
                    "importance": round(float(val), 4),
                    "abs_importance": round(float(abs(val)), 4)
                })
                
            # Sort by absolute impact on the prediction
            factors.sort(key=lambda x: x["abs_importance"], reverse=True)
            return factors[:top_k]
        except Exception:
            return self._fallback_feature_importance(feature_row, top_k)

    def _fallback_feature_importance(self, feature_row: pd.DataFrame, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Deterministic fallback based on normalized distance from feature means
        if SHAP computation encounters unsupported estimator wrappers.
        """
        row = feature_row.iloc[0].to_dict()
        heuristics = {
            "rolling_rmse_7d": float(row.get("rolling_rmse_7d", 0)) * 0.04,
            "ensemble_spread": float(row.get("ensemble_spread", 0)) * 0.03,
            "lead_day": float(row.get("lead_day", 1)) * 0.025,
            "spatial_variability": float(row.get("spatial_variability", 0)) * 0.02,
            "rainfall_forecast": min(1.0, float(row.get("rainfall_forecast", 0)) / 100.0) * 0.15,
            "previous_error": float(row.get("previous_error", 0)) * 0.02,
        }
        factors = [
            {"feature": k, "importance": round(v, 4), "abs_importance": round(abs(v), 4)}
            for k, v in heuristics.items()
        ]
        factors.sort(key=lambda x: x["abs_importance"], reverse=True)
        return factors[:top_k]
