"""
ForecastGuard Configuration Settings.
Loads parameters from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEMO_MODE: bool = True
    DATA_PROVIDER: str = "demo"
    
    # ML & Bust definition parameters
    BUST_PERCENTILE: float = Field(default=90.0, description="Percentile of historical absolute error to classify as a bust")
    MIN_ERROR_THRESHOLD_MM: float = Field(default=10.0, description="Minimum absolute error in mm to qualify as a bust even if above percentile")
    
    # Paths
    MODEL_PATH: str = "models/forecastguard_xgb_calibrated.joblib"
    DATA_DIR: str = "data"
    
    # Database URL (SQLite default fallback, or PostgreSQL)
    DATABASE_URL: str = "sqlite:///./data/forecastguard.db"
    
    # CORS
    CORS_ORIGINS: str = (
        "https://forecastguard-3ebv.onrender.com,"
        "https://forecastguard-6xm3.onrender.com,"
        "http://localhost:5173,http://localhost:3000,"
        "http://127.0.0.1:5173,http://127.0.0.1:3000,"
        "http://localhost:8000"
    )

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        else:
            origins = list(self.CORS_ORIGINS)
        
        always_allowed = [
            "https://forecastguard-3ebv.onrender.com",
            "https://forecastguard-6xm3.onrender.com",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://localhost:8000"
        ]
        for origin in always_allowed:
            if origin not in origins:
                origins.append(origin)
        return origins
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
