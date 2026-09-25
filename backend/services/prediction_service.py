"""
Prediction Service for ForecastGuard.
Orchestrates data retrieval, feature extraction, calibrated ML inference,
SHAP explanation generation, confidence estimation, and GeoJSON formatting.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from backend.config.settings import settings
from backend.services.data_service import data_provider, INDIAN_REGIONS
from backend.services.feature_service import FeatureService
from backend.services.confidence_service import ConfidenceService
from backend.services.reason_service import ReasonService
from backend.services.verification_service import VerificationService
from backend.ml.model_loader import predictor

class PredictionService:
    @staticmethod
    def get_risk_prediction(region: str, lead_day: int, variable: str = "rainfall") -> Dict[str, Any]:
        """
        Computes calibrated bust probability, confidence rating, and explanation reasons
        for a single (region, lead_day) query.
        """
        fcst_record = data_provider.get_forecast_for_region(region, lead_day, variable)
        
        if not fcst_record:
            # Generate default representative meteorological profile if record is missing
            matched_reg = next((r for r in INDIAN_REGIONS if r["name"].lower() == region.lower()), INDIAN_REGIONS[0])
            fcst_record = {
                "forecast_id": f"SYN_{region[:3].upper()}_D{lead_day}",
                "initialization_time": datetime.utcnow().strftime("%Y-%m-%d"),
                "valid_time": datetime.utcnow().strftime("%Y-%m-%d"),
                "region": matched_reg["name"],
                "lead_day": lead_day,
                "rainfall_forecast": round(float(matched_reg["base_rain"] * 1.2), 1),
                "temperature_forecast": 29.0,
                "wind_forecast": 12.0,
                "pressure_forecast": 1006.0,
                "humidity_forecast": 75.0,
                "ensemble_spread": round(float(3.0 + lead_day * 0.8), 1),
                "ensemble_mean": round(float(matched_reg["base_rain"] * 1.2), 1),
                "spatial_variability": 3.2,
                "data_source": "DEMO DATA"
            }

        # Historical rolling verification stats
        history_stats = data_provider.get_rolling_stats(region, lead_day) if hasattr(data_provider, "get_rolling_stats") else {}
        
        # Extract ML feature vector
        feature_df = FeatureService.extract_feature_vector(fcst_record, history_stats)
        
        # Calibrated prediction
        raw_prob, cal_prob = predictor.predict_probability(feature_df)
        
        # Confidence calculation
        conf = ConfidenceService.calculate_confidence(
            bust_probability=cal_prob,
            lead_day=lead_day,
            ensemble_spread=float(fcst_record.get("ensemble_spread", 3.5)),
            rolling_rmse=float(history_stats.get("rolling_rmse_7d", 5.0))
        )
        
        # SHAP factor extraction
        shap_factors = predictor.explain(feature_df, top_k=4)
        
        # Reason Code generation
        reasons = ReasonService.generate_reasons(
            shap_factors=shap_factors,
            feature_values=feature_df.iloc[0].to_dict(),
            bust_probability=cal_prob
        )
        
        # Bust threshold
        bust_threshold = data_provider.get_bust_threshold(region, lead_day) if hasattr(data_provider, "get_bust_threshold") else 25.0
        
        return {
            "region": fcst_record.get("region", region),
            "lead_day": lead_day,
            "variable": variable,
            "forecast_value": float(fcst_record.get("rainfall_forecast", 0.0)),
            "bust_probability": cal_prob,
            "raw_bust_probability": raw_prob,
            "confidence": conf,
            "bust_threshold": float(bust_threshold),
            "historical_mae": float(history_stats.get("historical_mae", 4.5)),
            "historical_rmse": float(history_stats.get("historical_rmse", 6.2)),
            "factors": reasons,
            "data_source": "DEMO DATA",
            "model_version": predictor.metadata.get("model_version", "ForecastGuard-v1.0-XGBoost-Calibrated"),
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    @staticmethod
    def get_risk_map(lead_day: int, variable: str = "rainfall") -> Dict[str, Any]:
        """
        Generates GeoJSON FeatureCollection with computed risk values across all 15 Indian regions.
        """
        features = []
        
        for reg in INDIAN_REGIONS:
            r_name = reg["name"]
            lat = reg["lat"]
            lon = reg["lon"]
            
            risk_data = PredictionService.get_risk_prediction(r_name, lead_day, variable)
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "region": r_name,
                    "zone": reg["zone"],
                    "climate": reg["climate"],
                    "lead_day": lead_day,
                    "forecast_rainfall": risk_data["forecast_value"],
                    "bust_probability": risk_data["bust_probability"],
                    "risk_code": risk_data["confidence"]["risk_code"],
                    "risk_level": risk_data["confidence"]["risk_level"],
                    "risk_color": risk_data["confidence"]["risk_color"],
                    "confidence_level": risk_data["confidence"]["level"],
                    "confidence_score": risk_data["confidence"]["score"],
                    "bust_threshold": risk_data["bust_threshold"],
                    "top_reason": risk_data["factors"][0]["title"] if risk_data["factors"] else "Standard uncertainty"
                }
            }
            features.append(feature)
            
        return {
            "type": "FeatureCollection",
            "lead_day": lead_day,
            "variable": variable,
            "data_source": "DEMO DATA",
            "features": features
        }

    @staticmethod
    def get_regional_profile(region: str, variable: str = "rainfall") -> Dict[str, Any]:
        """
        Computes 10-day lead time reliability profile for a specific region.
        """
        profile = []
        for d in range(1, 11):
            pred = PredictionService.get_risk_prediction(region, d, variable)
            profile.append({
                "lead_day": d,
                "forecast_rainfall": pred["forecast_value"],
                "bust_probability": pred["bust_probability"],
                "confidence_score": pred["confidence"]["score"],
                "confidence_level": pred["confidence"]["level"],
                "risk_code": pred["confidence"]["risk_code"],
                "risk_color": pred["confidence"]["risk_color"],
                "bust_threshold": pred["bust_threshold"],
                "historical_mae": pred["historical_mae"]
            })
            
        return {
            "region": region,
            "variable": variable,
            "data_source": "DEMO DATA",
            "lead_profile": profile
        }

    @staticmethod
    def execute_historical_replay(date: str, region: str, lead_day: int) -> Dict[str, Any]:
        """
        Performs historical replay:
        1. Finds historical forecast and ground-truth observation.
        2. Runs ForecastGuard calibrated model on historical feature state.
        3. Computes actual verification error and checks whether it met ground truth bust criteria.
        4. Validates if ForecastGuard's prediction was correct.
        """
        case = data_provider.get_historical_case(date, region, lead_day)
        
        if not case:
            # Fallback to realistic case
            case = {
                "initialization_time": date,
                "region": region,
                "lead_day": lead_day,
                "rainfall_forecast": 84.0,
                "rainfall_observed": 39.0,
                "ensemble_spread": 8.5,
                "spatial_variability": 4.1
            }
            
        fcst_val = float(case.get("rainfall_forecast", 84.0))
        obs_val = float(case.get("rainfall_observed", 39.0))
        
        errors = VerificationService.calculate_errors(fcst_val, obs_val)
        abs_err = errors["absolute_error"]
        signed_err = errors["signed_error"]
        
        # Historical threshold for this region & lead_day
        bust_threshold = data_provider.get_bust_threshold(region, lead_day) if hasattr(data_provider, "get_bust_threshold") else 30.0
        actual_bust = bool(abs_err >= bust_threshold)
        
        # Run ML prediction on historical case
        history_stats = data_provider.get_rolling_stats(region, lead_day) if hasattr(data_provider, "get_rolling_stats") else {}
        feature_df = FeatureService.extract_feature_vector(case, history_stats)
        raw_prob, cal_prob = predictor.predict_probability(feature_df)
        
        # Binary prediction decision at 0.50 threshold
        predicted_bust_decision = bool(cal_prob >= 0.50)
        prediction_correct = bool(predicted_bust_decision == actual_bust)
        
        # Confidence
        conf = ConfidenceService.calculate_confidence(
            bust_probability=cal_prob,
            lead_day=lead_day,
            ensemble_spread=float(case.get("ensemble_spread", 5.0)),
            rolling_rmse=float(history_stats.get("rolling_rmse_7d", 6.0))
        )
        
        # Explanations
        shap_factors = predictor.explain(feature_df, top_k=4)
        reasons = ReasonService.generate_reasons(
            shap_factors=shap_factors,
            feature_values=feature_df.iloc[0].to_dict(),
            bust_probability=cal_prob
        )
        
        return {
            "date": date,
            "region": region,
            "lead_day": lead_day,
            "variable": "rainfall",
            "forecast_value": fcst_val,
            "observed_value": obs_val,
            "absolute_error": abs_err,
            "signed_error": signed_err,
            "bust_threshold": bust_threshold,
            "predicted_bust_probability": cal_prob,
            "predicted_bust_decision": predicted_bust_decision,
            "actual_bust": actual_bust,
            "prediction_correct": prediction_correct,
            "confidence": conf,
            "factors": reasons,
            "data_source": "HISTORICAL REPLAY — DEMONSTRATION DATA"
        }
