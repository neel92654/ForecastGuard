"""
Feature Engineering Engine for ForecastGuard.
Transforms raw medium-range forecasts, spatial cues, temporal markers,
and rolling error verification histories into feature vectors for ML models.
"""

import numpy as np
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Tuple

# Standard ML feature names in order
FEATURE_COLUMNS = [
    "lead_day",
    "rainfall_forecast",
    "temperature_forecast",
    "wind_forecast",
    "pressure_forecast",
    "humidity_forecast",
    "ensemble_spread",
    "ensemble_mean",
    "ens_spread_to_mean_ratio",
    "spatial_variability",
    "rolling_mae_7d",
    "rolling_rmse_7d",
    "rolling_bias_7d",
    "previous_error",
    "historical_bust_rate",
    "month",
    "day_of_year",
    "sin_doy",
    "cos_doy",
    "is_monsoon"
]

class FeatureService:
    @staticmethod
    def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Takes raw verification historical dataframe, sorts chronologically,
        and computes time-aware rolling features, temporal cyclics, and ensemble ratios.
        Avoids future-data leakage by using shift() for rolling statistics.
        """
        df = df.copy()
        
        # Ensure correct datetime types
        if "initialization_time" in df.columns:
            df["initialization_time"] = pd.to_datetime(df["initialization_time"])
        if "valid_time" in df.columns:
            df["valid_time"] = pd.to_datetime(df["valid_time"])
            
        # Sort chronologically by region, lead_day, and initialization_time
        df = df.sort_values(by=["region", "lead_day", "initialization_time"]).reset_index(drop=True)
        
        # Temporal cyclic features
        dates = df["initialization_time"]
        df["month"] = dates.dt.month
        df["day_of_year"] = dates.dt.dayofyear
        df["sin_doy"] = np.sin(2 * np.pi * df["day_of_year"] / 365.25)
        df["cos_doy"] = np.cos(2 * np.pi * df["day_of_year"] / 365.25)
        df["is_monsoon"] = df["month"].isin([6, 7, 8, 9]).astype(int)
        
        # Ensemble dispersion ratio
        df["ens_spread_to_mean_ratio"] = df["ensemble_spread"] / (df["rainfall_forecast"] + 1.0)
        
        # Grouped rolling error history per region and lead_day
        # Shift by 1 to strictly prevent lookahead / target leakage
        grouped = df.groupby(["region", "lead_day"])
        
        df["previous_error"] = grouped["absolute_error"].shift(1).fillna(0.0)
        
        # Rolling 7-day MAE
        df["rolling_mae_7d"] = (
            grouped["absolute_error"]
            .shift(1)
            .rolling(window=7, min_periods=1)
            .mean()
            .fillna(0.0)
        )
        
        # Rolling 7-day RMSE
        df["rolling_rmse_7d"] = (
            grouped["absolute_error"]
            .shift(1)
            .rolling(window=7, min_periods=1)
            .apply(lambda x: np.sqrt(np.mean(x**2)) if len(x) > 0 else 0.0, raw=True)
            .fillna(0.0)
        )
        
        # Rolling 7-day signed Bias
        df["rolling_bias_7d"] = (
            grouped["signed_error"]
            .shift(1)
            .rolling(window=7, min_periods=1)
            .mean()
            .fillna(0.0)
        )
        
        # Historical bust rate (rolling 14-day)
        if "is_bust" in df.columns:
            df["historical_bust_rate"] = (
                grouped["is_bust"]
                .shift(1)
                .rolling(window=14, min_periods=1)
                .mean()
                .fillna(0.10)
            )
        else:
            df["historical_bust_rate"] = 0.10
            
        return df

    @staticmethod
    def extract_feature_vector(forecast_row: Dict[str, Any], history_stats: Dict[str, float] = None) -> pd.DataFrame:
        """
        Extracts single inference feature vector matching FEATURE_COLUMNS from a forecast dictionary.
        """
        init_time = pd.to_datetime(forecast_row.get("initialization_time", datetime.utcnow().strftime("%Y-%m-%d")))
        month = init_time.month
        day_of_year = init_time.dayofyear
        sin_doy = float(np.sin(2 * np.pi * day_of_year / 365.25))
        cos_doy = float(np.cos(2 * np.pi * day_of_year / 365.25))
        is_monsoon = 1 if month in [6, 7, 8, 9] else 0
        
        rf = float(forecast_row.get("rainfall_forecast", 0.0))
        spread = float(forecast_row.get("ensemble_spread", 3.5))
        ens_mean = float(forecast_row.get("ensemble_mean", rf))
        spread_ratio = float(spread / (rf + 1.0))
        spatial_var = float(forecast_row.get("spatial_variability", 2.0))
        
        # Merge with historical stats if available
        stats = history_stats or {}
        rolling_mae = float(stats.get("rolling_mae_7d", 4.5))
        rolling_rmse = float(stats.get("rolling_rmse_7d", 6.2))
        rolling_bias = float(stats.get("rolling_bias_7d", 0.5))
        prev_err = float(stats.get("previous_error", 3.8))
        bust_rate = float(stats.get("historical_bust_rate", 0.10))
        
        row_dict = {
            "lead_day": int(forecast_row.get("lead_day", 1)),
            "rainfall_forecast": rf,
            "temperature_forecast": float(forecast_row.get("temperature_forecast", 28.0)),
            "wind_forecast": float(forecast_row.get("wind_forecast", 10.0)),
            "pressure_forecast": float(forecast_row.get("pressure_forecast", 1008.0)),
            "humidity_forecast": float(forecast_row.get("humidity_forecast", 70.0)),
            "ensemble_spread": spread,
            "ensemble_mean": ens_mean,
            "ens_spread_to_mean_ratio": spread_ratio,
            "spatial_variability": spatial_var,
            "rolling_mae_7d": rolling_mae,
            "rolling_rmse_7d": rolling_rmse,
            "rolling_bias_7d": rolling_bias,
            "previous_error": prev_err,
            "historical_bust_rate": bust_rate,
            "month": month,
            "day_of_year": day_of_year,
            "sin_doy": sin_doy,
            "cos_doy": cos_doy,
            "is_monsoon": is_monsoon
        }
        
        return pd.DataFrame([row_dict])[FEATURE_COLUMNS]
