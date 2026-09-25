# ForecastGuard — System Architecture

## Overview
ForecastGuard is an AI-based forecast bust detection and reliability intelligence layer built for medium-range Numerical Weather Prediction (NWP) systems (MoES / NCMRWF).

**Core Principle:** ForecastGuard does NOT replace the forecast. It predicts the reliability of the forecast.

```
                  ┌────────────────────────────────────────┐
                  │          WEATHER DATA SOURCES          │
                  │   Forecasts (D1-D10) + Observations    │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │        DATA PROCESSING PIPELINE        │
                  │       Python / xarray / Pandas         │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       FORECAST VERIFICATION ENGINE     │
                  │    AE, Signed Error, MAE, RMSE, Bias   │
                  │  Bust Thresholds (90th Percentile)     │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       FEATURE ENGINEERING ENGINE       │
                  │ Rolling Error Stats, Ensemble Spreads, │
                  │ Spatial Gradients, Cyclic Seasonality  │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │        ML BUST INFERENCE ENGINE        │
                  │   XGBoost + Isotonic Calibrator        │
                  │     TreeSHAP Attribution Layer         │
                  └───────────────────┬────────────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             ▼                        ▼                        ▼
     BUST PROBABILITY         CONFIDENCE SCORE         REASON EXPLANATIONS
     (Calibrated 0-1)         (Composite 0-100%)       (SHAP-Derived Cards)
             │                        │                        │
             └────────────────────────┼────────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │           FASTAPI REST SERVER          │
                  │  /api/risk, /api/risk-map, /api/replay │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │      INTERACTIVE REACT DASHBOARD       │
                  │   National Risk Map, Lead Day 1-10,    │
                  │ Historical Replay Lab, Verification UI │
                  └────────────────────────────────────────┘
```

## System Subsystems

### 1. Data Provider Interface (`ForecastDataProvider`)
- `DemoForecastProvider`: High-fidelity synthetic historical meteorological dataset across 15 Indian divisions covering Southwest/Northeast monsoons, synoptic low disturbances, and convective regimes.
- `ExternalForecastProvider`: Adaptable interface for operational NetCDF / GRIB / IMD observational feeds.

### 2. Forecast Verification Engine
- Pointwise: Absolute Error ($|F - O|$), Signed Bias ($F - O$), Relative Error ($|F - O| / (O + 1)$).
- Regional & Bulk: MAE, RMSE, Mean Bias, and context-aware Quantile Bust Thresholding ($Q_{90}$).

### 3. ML Bust Detection Engine
- Time-aware chronological splits (Train / Val / Test).
- Model Suite: Logistic Regression (Baseline), Random Forest, Calibrated XGBoost (Primary).
- Isotonic Probability Calibration via cross-validated holdout fitting.
- TreeSHAP Local Feature Attribution mapping into human-readable Reason Codes.

### 4. Application Server & Storage
- FastAPI with Pydantic validation, CORS, and OpenAPI docs.
- SQLite (standalone zero-config dev) / PostgreSQL (production/dockerized).
