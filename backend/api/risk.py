"""
Risk Prediction and Risk Map API Endpoints.
"""

from fastapi import APIRouter, Query
from backend.services.prediction_service import PredictionService
from backend.schemas.api_models import RiskPredictionResponse, RiskMapResponse

router = APIRouter(prefix="/api", tags=["Risk"])

@router.get("/risk", response_model=RiskPredictionResponse)
def get_risk(
    region: str = Query("Gujarat", description="Indian region name"),
    lead_day: int = Query(5, ge=1, le=10, description="Lead day (1 to 10)"),
    variable: str = Query("rainfall", description="Meteorological variable")
):
    """
    Returns calibrated bust probability, confidence rating, bust threshold,
    and contributing explanation factors for a region and lead day.
    """
    return PredictionService.get_risk_prediction(region=region, lead_day=lead_day, variable=variable)

@router.get("/risk-map", response_model=RiskMapResponse)
def get_risk_map(
    lead_day: int = Query(5, ge=1, le=10, description="Lead day (1 to 10)"),
    variable: str = Query("rainfall", description="Meteorological variable")
):
    """
    Returns dynamic GeoJSON FeatureCollection with computed risk values across India
    for the selected forecast lead day.
    """
    return PredictionService.get_risk_map(lead_day=lead_day, variable=variable)
