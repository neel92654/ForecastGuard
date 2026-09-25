"""
Forecast Confidence Evaluation Service for ForecastGuard.
Calculates operational forecast confidence scores based on calibrated bust probability,
ensemble spread, lead-time horizon, and historical error volatility.
"""

from typing import Dict, Any

class ConfidenceService:
    @staticmethod
    def calculate_confidence(
        bust_probability: float, 
        lead_day: int, 
        ensemble_spread: float = 3.0,
        rolling_rmse: float = 5.0
    ) -> Dict[str, Any]:
        """
        Derives an operational confidence classification and composite score (0-100%).
        
        Confidence is NOT merely `100 - bust_probability * 100`. It factors in:
        1. Calibrated Bust Risk (50% weight)
        2. Lead-Time Horizon Decay (25% weight)
        3. Ensemble Spread / Atmospheric Agreement (25% weight)
        """
        # 1. Bust Risk penalty (0.0 to 1.0 -> 100 to 0)
        risk_component = max(0.0, 1.0 - bust_probability) * 100.0
        
        # 2. Lead time decay: D1 = 100%, D10 = 55%
        lead_factor = max(50.0, 105.0 - (lead_day * 5.0))
        
        # 3. Ensemble spread penalty: spread <= 2.0 is 100%, spread >= 15.0 is 40%
        spread_factor = max(40.0, min(100.0, 110.0 - (ensemble_spread * 4.5)))
        
        # Composite Confidence Score (0 to 100)
        composite_score = round(
            0.50 * risk_component + 
            0.25 * lead_factor + 
            0.25 * spread_factor, 
            1
        )
        
        # Categorical assignment
        if composite_score >= 75.0 and bust_probability < 0.30:
            level = "HIGH"
            badge_color = "emerald"
            summary = "High Confidence: Forecast models exhibit strong consensus, short lead horizon, and low historical bust risk."
        elif composite_score >= 50.0 and bust_probability < 0.60:
            level = "MEDIUM"
            badge_color = "amber"
            summary = "Medium Confidence: Forecast is operationally usable with moderate uncertainty in precipitation volume."
        elif composite_score >= 30.0:
            level = "LOW"
            badge_color = "orange"
            summary = "Low Confidence: Elevated bust risk detected. Model members diverge and precipitation timing/intensity may shift."
        else:
            level = "VERY LOW"
            badge_color = "rose"
            summary = "Very Low Confidence / High Bust Alert: High likelihood of significant forecast error exceeding regional thresholds."
            
        # Also derive risk category for the UI
        if bust_probability < 0.25:
            risk_level = "LOW RISK"
            risk_code = "LOW"
            risk_color = "#10b981" # Green
        elif bust_probability < 0.50:
            risk_level = "MEDIUM RISK"
            risk_code = "MEDIUM"
            risk_color = "#f59e0b" # Yellow / Amber
        elif bust_probability < 0.75:
            risk_level = "HIGH RISK"
            risk_code = "HIGH"
            risk_color = "#f97316" # Orange
        else:
            risk_level = "VERY HIGH RISK"
            risk_code = "VERY_HIGH"
            risk_color = "#ef4444" # Red
            
        return {
            "level": level,
            "score": composite_score,
            "badge_color": badge_color,
            "summary": summary,
            "risk_level": risk_level,
            "risk_code": risk_code,
            "risk_color": risk_color
        }
