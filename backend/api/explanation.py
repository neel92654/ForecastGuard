"""
Explainability and SHAP Feature Factor API Endpoints.
"""

from fastapi import APIRouter, Query
from typing import List, Dict, Any
from backend.services.prediction_service import PredictionService
from backend.schemas.api_models import ReasonItem

router = APIRouter(prefix="/api/explanation", tags=["Explanation"])

@router.get("", response_model=List[ReasonItem])
def get_explanation(
    region: str = Query("Gujarat", description="Indian region name"),
    lead_day: int = Query(5, ge=1, le=10, description="Lead day (1 to 10)"),
    variable: str = Query("rainfall", description="Meteorological variable")
):
    """
    Returns SHAP-derived meteorological factors contributing to forecast bust risk.
    """
    pred = PredictionService.get_risk_prediction(region=region, lead_day=lead_day, variable=variable)
    return pred["factors"]
