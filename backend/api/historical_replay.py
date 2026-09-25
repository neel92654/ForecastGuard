"""
Historical Replay Simulation API Endpoint.
"""

from fastapi import APIRouter, HTTPException
from backend.services.prediction_service import PredictionService
from backend.schemas.api_models import HistoricalReplayRequest, HistoricalReplayResponse

router = APIRouter(prefix="/api/historical-replay", tags=["Historical Replay"])

@router.post("", response_model=HistoricalReplayResponse)
def execute_replay(request: HistoricalReplayRequest):
    """
    Executes a historical forecast replay:
    Extracts historical forecast, retrieves ground observation, computes error,
    runs ForecastGuard model, evaluates actual bust vs predicted bust probability.
    """
    try:
        return PredictionService.execute_historical_replay(
            date=request.date,
            region=request.region,
            lead_day=request.lead_day
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Historical replay execution error: {str(e)}")
