"""
Probability Calibration and Verification Metrics for ForecastGuard.
Supports Isotonic Regression and Sigmoid (Platt) calibration,
evaluates Brier score, and computes reliability curve coordinates.
"""

import numpy as np
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss, log_loss
from typing import Dict, Any, Tuple

class ModelCalibrator:
    def __init__(self, method: str = "isotonic"):
        """
        method: 'isotonic' or 'sigmoid'
        """
        self.method = method
        self.calibrator = None

    def fit_calibrator(self, base_estimator, X_val, y_val):
        """
        Fits a calibrated wrapper on a pre-trained base estimator using a holdout validation set.
        """
        calibrated_model = CalibratedClassifierCV(
            estimator=base_estimator,
            method=self.method,
            cv="prefit"
        )
        calibrated_model.fit(X_val, y_val)
        self.calibrator = calibrated_model
        return self.calibrator

    @staticmethod
    def evaluate_calibration(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 5) -> Dict[str, Any]:
        """
        Computes Brier Score and calibration curve bins for verification display.
        """
        y_true = np.asarray(y_true, dtype=int)
        y_prob = np.asarray(y_prob, dtype=float)
        
        brier = float(brier_score_loss(y_true, y_prob))
        
        # Calibration curve
        prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=n_bins, strategy="uniform")
        
        curve_points = [
            {"predicted": round(float(p), 3), "observed": round(float(o), 3)}
            for p, o in zip(prob_pred, prob_true)
        ]
        
        return {
            "brier_score": round(brier, 4),
            "calibration_curve": curve_points,
            "mean_predicted_probability": round(float(np.mean(y_prob)), 3),
            "empirical_bust_rate": round(float(np.mean(y_true)), 3)
        }
