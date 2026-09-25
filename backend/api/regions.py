"""
Regional Metadata and Boundary API Endpoints.
"""

from fastapi import APIRouter
from typing import List
from backend.services.data_service import data_provider
from backend.schemas.api_models import RegionInfo

router = APIRouter(prefix="/api/regions", tags=["Regions"])

@router.get("", response_model=List[RegionInfo])
def list_regions():
    """Returns all supported Indian meteorological divisions/regions."""
    return data_provider.get_regions()
