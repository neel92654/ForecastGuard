"""
Forecast Ingestion and Retrieval API Endpoints.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from backend.services.data_service import data_provider
from backend.services.prediction_service import PredictionService
from backend.schemas.api_models import RegionalProfileResponse

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])

@router.get("/latest")
def get_latest_forecasts(variable: str = Query("rainfall", description="Meteorological variable")):
    """Returns the latest NWP forecast records across regions."""
    forecasts = data_provider.get_latest_forecasts(variable)
    return {
        "status": "success",
        "variable": variable,
        "count": len(forecasts),
        "data_source": "DEMO DATA",
        "forecasts": forecasts[:50] # Sample payload
    }

@router.get("/profile", response_model=RegionalProfileResponse)
def get_regional_profile(
    region: str = Query("Gujarat", description="Indian state or meteorological subdivision"),
    variable: str = Query("rainfall", description="Meteorological variable")
):
    """Returns 10-day lead time reliability profile for the selected region."""
    return PredictionService.get_regional_profile(region=region, variable=variable)
