"""
ForecastGuard FastAPI Application Main Entrypoint.
AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts.
Ministry of Earth Sciences (MoES) / NCMRWF.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

from backend.config.settings import settings
from backend.db.database import init_db
from backend.ml.model_loader import predictor
from backend.schemas.api_models import HealthResponse

# Import route modules
from backend.api.regions import router as regions_router
from backend.api.forecast import router as forecast_router
from backend.api.risk import router as risk_router
from backend.api.explanation import router as explanation_router
from backend.api.verification import router as verification_router
from backend.api.historical_replay import router as replay_router

app = FastAPI(
    title="ForecastGuard API",
    description="AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts (NCMRWF / MoES)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Initializes database tables on server startup."""
    try:
        init_db()
        print("[ForecastGuard API] Database initialized successfully.")
    except Exception as e:
        print(f"[ForecastGuard API] Database init warning: {e}")

# Include API Routers
app.include_router(regions_router)
app.include_router(forecast_router)
app.include_router(risk_router)
app.include_router(explanation_router)
app.include_router(verification_router)
app.include_router(replay_router)

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Returns server and ML model health status."""
    return {
        "status": "ONLINE",
        "service": "ForecastGuard",
        "model_version": predictor.metadata.get("model_version", "ForecastGuard-v1.0"),
        "model_status": "PROTOTYPE_TRAINED" if not predictor.is_baseline_fallback else "BASELINE_FALLBACK",
        "data_source": "DEMO DATA" if settings.DEMO_MODE else "EXTERNAL DATA",
        "demo_mode": settings.DEMO_MODE,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
