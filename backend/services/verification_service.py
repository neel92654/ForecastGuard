"""
Forecast Verification Engine for ForecastGuard.
Computes meteorological verification metrics: AE, Signed Error, Relative Error,
MAE, RMSE, Bias, and context-aware historical bust thresholding.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional

class VerificationService:
    @staticmethod
    def calculate_errors(forecast_val: float, observed_val: float, epsilon: float = 1.0) -> Dict[str, float]:
        """
        Calculates pointwise verification metrics for a single forecast-observation pair.
        Prevents division by zero on dry days using epsilon.
        """
        abs_err = abs(forecast_val - observed_val)
        signed_err = forecast_val - observed_val
        rel_err = abs_err / (observed_val + epsilon)
        
        return {
            "absolute_error": round(float(abs_err), 2),
            "signed_error": round(float(signed_err), 2),
            "relative_error": round(float(rel_err), 4)
        }

    @staticmethod
    def compute_bulk_metrics(forecasts: np.ndarray, observations: np.ndarray) -> Dict[str, float]:
        """
        Computes aggregate forecast verification metrics: MAE, RMSE, Bias (Mean Error),
        Correlation Coefficient, and Scatter Index.
        """
        forecasts = np.asarray(forecasts, dtype=float)
        observations = np.asarray(observations, dtype=float)
        
        # Filter out NaN values if any
        valid_mask = (~np.isnan(forecasts)) & (~np.isnan(observations))
        f = forecasts[valid_mask]
        o = observations[valid_mask]
        
        if len(f) == 0:
            return {
                "mae": 0.0,
                "rmse": 0.0,
                "bias": 0.0,
                "corr": 0.0,
                "count": 0
            }
            
        errors = f - o
        abs_errors = np.abs(errors)
        
        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        bias = float(np.mean(errors))
        
        # Pearson correlation
        if len(f) > 1 and np.std(f) > 1e-6 and np.std(o) > 1e-6:
            corr = float(np.corrcoef(f, o)[0, 1])
        else:
            corr = 1.0 if np.allclose(f, o) else 0.0
            
        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "bias": round(bias, 2),
            "corr": round(corr, 3),
            "count": int(len(f))
        }

    @staticmethod
    def compute_bust_thresholds(
        df_history: pd.DataFrame, 
        percentile: float = 90.0, 
        min_threshold_mm: float = 10.0
    ) -> pd.DataFrame:
        """
        Calculates context-aware historical bust threshold for each (region, lead_day).
        A forecast is considered a bust if Absolute Error exceeds the historical
        percentile (e.g. 90th percentile) AND exceeds a minimum physical threshold (e.g. 10mm).
        """
        grouped = df_history.groupby(["region", "lead_day"])["absolute_error"]
        thresholds = grouped.quantile(percentile / 100.0).reset_index()
        thresholds.rename(columns={"absolute_error": "bust_threshold"}, inplace=True)
        
        # Enforce minimum physical threshold to avoid calling small 2mm errors a bust in arid dry seasons
        thresholds["bust_threshold"] = thresholds["bust_threshold"].apply(lambda x: max(min_threshold_mm, round(float(x), 2)))
        return thresholds

    @staticmethod
    def apply_bust_labels(
        df: pd.DataFrame, 
        thresholds_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Merges calculated bust thresholds and assigns binary target:
        bust = 1 if absolute_error >= bust_threshold else 0
        """
        df_labeled = df.merge(thresholds_df, on=["region", "lead_day"], how="left")
        
        # Fill missing thresholds with global 90th percentile fallback if any
        if df_labeled["bust_threshold"].isna().any():
            global_threshold = max(10.0, df["absolute_error"].quantile(0.90))
            df_labeled["bust_threshold"] = df_labeled["bust_threshold"].fillna(global_threshold)
            
        df_labeled["is_bust"] = (df_labeled["absolute_error"] >= df_labeled["bust_threshold"]).astype(int)
        return df_labeled
