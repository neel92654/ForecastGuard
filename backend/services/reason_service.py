"""
Reason Code System for ForecastGuard.
Translates technical ML/SHAP feature contributions into clear, human-understandable,
actionable meteorological reason cards with severity levels.
"""

from typing import List, Dict, Any

REASON_DEFINITIONS = {
    "rolling_rmse_7d": {
        "code": "HIGH_HISTORICAL_ERROR",
        "title": "High Historical Error",
        "description": "Recent 7-day forecast error has been elevated for this meteorological division.",
        "high_text": "Model errors in this region have spiked significantly over the past 7 days.",
        "low_text": "Historical verification shows stable, low-error performance for this region."
    },
    "rolling_mae_7d": {
        "code": "HIGH_HISTORICAL_ERROR",
        "title": "Persistent Verification Bias",
        "description": "Historical absolute error exceeds standard regional tolerance bounds.",
        "high_text": "Consistent absolute discrepancy between NWP model and ground stations.",
        "low_text": "Mean absolute deviation is well within expected operational limits."
    },
    "ensemble_spread": {
        "code": "HIGH_ENSEMBLE_SPREAD",
        "title": "High Forecast Member Spread",
        "description": "Available ensemble members show substantial disagreement on timing or intensity.",
        "high_text": "Ensemble perturbation analysis indicates significant bifurcation in track or convective initiation.",
        "low_text": "Ensemble members show strong clustering and high model agreement."
    },
    "ens_spread_to_mean_ratio": {
        "code": "HIGH_ENSEMBLE_SPREAD",
        "title": "Ensemble Spread to Mean Dispersion",
        "description": "Uncertainty spread is disproportionately high relative to forecasted rainfall volume.",
        "high_text": "Dispersion-to-signal ratio indicates high sensitivity to initial condition noise.",
        "low_text": "Spread-to-signal ratio is low and consistent."
    },
    "lead_day": {
        "code": "LONG_LEAD_TIME",
        "title": "Extended Lead Time Horizon",
        "description": "Forecast lead time is deep in the medium-range horizon where atmospheric predictability decays.",
        "high_text": "Lead time >= Day 5 naturally increases non-linear dynamic growth of error.",
        "low_text": "Short lead time (Day 1-3) provides higher deterministic reliability."
    },
    "spatial_variability": {
        "code": "HIGH_SPATIAL_VARIABILITY",
        "title": "Sharp Spatial Gradient",
        "description": "Rainfall forecasts vary strongly across neighboring subdivisions.",
        "high_text": "High spatial variance suggests localized convective cells prone to spatial displacement busts.",
        "low_text": "Precipitation field is synoptically uniform across adjoining zones."
    },
    "rainfall_forecast": {
        "code": "HEAVY_PRECIPITATION_ANOMALY",
        "title": "Heavy Rainfall Magnitude",
        "description": "High forecasted rainfall magnitude increases vulnerability to volume over/underestimation.",
        "high_text": "Heavy or extreme rainfall forecasts historically carry higher bust probabilities.",
        "low_text": "Light to moderate forecasted rain has standard reliability."
    },
    "is_monsoon": {
        "code": "MONSOON_DYNAMICS",
        "title": "Active Monsoon Synoptic Flow",
        "description": "Monsoon circulation regimes feature rapid convective feedback and low-pressure track wobbles.",
        "high_text": "Southwest monsoon season dynamics heighten sensitivity to orographic and mesoscale interactions.",
        "low_text": "Dry/winter season dynamics exhibit standard predictability."
    },
    "previous_error": {
        "code": "RECENT_FORECAST_INSTABILITY",
        "title": "Recent Model Instability",
        "description": "The immediately preceding forecast cycle experienced a notable verification error.",
        "high_text": "Prior forecast run failed to capture observed rainfall accurately.",
        "low_text": "Prior forecast cycle verified accurately with ground observations."
    }
}

class ReasonService:
    @staticmethod
    def generate_reasons(
        shap_factors: List[Dict[str, Any]], 
        feature_values: Dict[str, Any],
        bust_probability: float
    ) -> List[Dict[str, Any]]:
        """
        Converts top SHAP feature contributions and feature values into user-facing reasons.
        """
        reasons = []
        seen_codes = set()
        
        for factor in shap_factors:
            feat_name = factor["feature"]
            impact = factor["importance"]
            val = feature_values.get(feat_name, None)
            
            definition = REASON_DEFINITIONS.get(feat_name)
            if not definition:
                continue
                
            code = definition["code"]
            if code in seen_codes:
                continue
                
            # Determine severity based on bust_probability and SHAP impact
            if bust_probability >= 0.65 or impact > 0.15:
                severity = "high"
                detail_text = definition["high_text"]
            elif bust_probability >= 0.35 or impact > 0.05:
                severity = "moderate"
                detail_text = definition["description"]
            else:
                severity = "low"
                detail_text = definition["low_text"]
                
            reasons.append({
                "code": code,
                "title": definition["title"],
                "description": detail_text,
                "severity": severity,
                "feature": feat_name,
                "importance": round(float(impact), 3),
                "feature_value": val
            })
            seen_codes.add(code)
            
            if len(reasons) >= 4:
                break
                
        # If fewer than 3 reasons generated, add context based on lead time and region
        if len(reasons) < 3:
            lead = feature_values.get("lead_day", 1)
            if "LONG_LEAD_TIME" not in seen_codes and lead >= 5:
                reasons.append({
                    "code": "LONG_LEAD_TIME",
                    "title": "Medium-Range Horizon",
                    "description": f"Lead time is Day {lead}, where synoptic predictability naturally declines.",
                    "severity": "moderate" if lead <= 6 else "high",
                    "feature": "lead_day",
                    "importance": 0.12,
                    "feature_value": lead
                })
                
        return reasons
