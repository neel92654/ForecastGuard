# ForecastGuard

AI-Based Forecast Bust Detection & Forecast Reliability Intelligence

## SIH Problem Statement

**SIH26079**

**Organization:** Ministry of Earth Sciences (MoES) / National Centre for Medium Range Weather Forecasting (NCMRWF)

**Theme:** Smart Automation

---

## What ForecastGuard Does

ForecastGuard does not replace numerical weather prediction (NWP) models.

It provides an operational reliability intelligence layer that estimates the probability that a medium-range forecast will experience an unusually large forecast error ("bust") at lead times from Day 1 to Day 10.

By analyzing historical forecast errors, ensemble spread, atmospheric dynamics, spatial gradients, and regional regime transitions, ForecastGuard equips meteorologists with early warning indicators before high-impact forecast discrepancies manifest.

---

## Core Capabilities

- **Forecast Bust Probability:** Calibrated probability estimation (0–100%) indicating likelihood of extreme forecast error exceeding historical quantile thresholds ($Q_{90}$).
- **Forecast Reliability Index:** A normalized 0–100 score classifying confidence into HIGH, MODERATE, or LOW reliability tiers.
- **Regional Risk Map:** Geospatial visualization of 15 Indian meteorological sub-divisions color-coded by bust risk.
- **Explainable Risk Factors:** TreeSHAP feature attribution translated into actionable operational reason codes (`HIGH_HISTORICAL_ERROR`, `HIGH_ENSEMBLE_SPREAD`, `LONG_LEAD_TIME`, `HIGH_SPATIAL_VARIABILITY`).
- **Historical Replay Laboratory:** Interactive scenario replay tool to analyze model behavior during past extreme weather events.
- **Forecast vs Observation Verification:** Pointwise and spatial verification against observed ground truth.
- **Model Comparison Benchmarks:** Side-by-side performance metrics across Logistic Regression, Random Forest, raw XGBoost, and Isotonic-Calibrated XGBoost.
- **Probability Calibration:** Reliability diagram curves and Brier score tracking ensuring predicted probabilities match empirical bust frequencies.
- **Day 1–Day 10 Lead-Day Analytics:** Lead-time performance decay matrix tracking RMSE, MAE, and bust rates from +24h to +240h horizons.

---

## Architecture

```
NWP Forecast + Observations + Historical Forecast Errors
                     ↓
             Error Calculation
                     ↓
                Bust Label ($Q_{90}$)
                     ↓
            Feature Engineering (20 features)
                     ↓
                 ML Model (XGBoost)
                     ↓
        Probability Calibration (Isotonic Regression)
                     ↓
             Forecast Bust Risk & SHAP Explanations
                     ↓
           Dashboard / REST API Endpoints
```

---

## Technology Stack

- **Frontend:** React 19, Vite, Leaflet, Vanilla CSS design tokens (WCAG AA compliant).
- **Backend:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy (PostgreSQL / SQLite).
- **ML & Analytics:** XGBoost, scikit-learn, SHAP, Isotonic Calibration.
- **Data Processing:** NumPy, Pandas, xarray/NetCDF compatible.
- **Testing:** pytest (17 automated unit and integration tests).
- **Containerization:** Docker, Docker Compose, Nginx.

---

## Demo Data Disclaimer

The current public prototype uses demonstration and synthetic validation data where applicable and is not connected to live NCMRWF operational forecast feeds unless explicitly configured with live institutional credentials and data feeds.

---

## Project Structure

```
ForecastGuard/
├── backend/
│   ├── api/             # FastAPI route handlers (risk, map, profile, verification, replay)
│   ├── config/          # Application settings and environment configuration
│   ├── db/              # Database models, schemas, and session handling
│   ├── ml/              # Model loaders, calibrators, inference pipeline, SHAP explainers
│   ├── schemas/         # Pydantic request/response data contracts
│   ├── services/        # Business logic: verification, features, confidence, data provider
│   └── main.py          # FastAPI server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Header, RiskMap, RiskCard, ConfidenceCard, ExplanationPanel, etc.
│   │   ├── pages/       # Operations Dashboard, Historical Replay, Verification Analytics
│   │   ├── services/    # REST API client
│   │   ├── App.jsx      # App root & route state
│   │   └── index.css    # Scientific dark UI design system
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── data/                # Demonstration dataset, historical CSVs, and SQLite database
├── models/              # Serialized ML model artifacts, threshold maps, and metrics JSON
├── scripts/             # Data generation and ML model training scripts
├── tests/               # Pytest test suite (17 passing tests)
├── docs/                # Technical architecture, ML docs, and API documentation
├── deployment/          # Nginx reverse proxy configuration
├── docker-compose.yml   # Multi-container orchestration (Postgres, Backend, Frontend)
├── Dockerfile.backend   # Backend container definition
├── Dockerfile.frontend  # Frontend multi-stage Nginx build
├── pytest.ini           # Pytest configuration
├── requirements.txt     # Python backend dependencies
├── .env.example         # Backend environment configuration template
└── README.md
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/neel92654/ForecastGuard.git
cd ForecastGuard

# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Re-train ML model & generate demonstration data
python scripts/train_model.py

# Start the FastAPI backend server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend server will start at `http://127.0.0.1:8000`.

### 2. Frontend Setup

```bash
# In a separate terminal window:
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend application will be accessible at `http://localhost:5173`.

---

## Testing

Run the automated test suite with:

```bash
pytest -v
```

All 17 tests validate endpoint routing, feature extraction, ML prediction ranges, isotonic calibration bounds, confidence score generation, and verification mathematical formulas.

---

## Production Build

To compile the production-optimized frontend bundle:

```bash
cd frontend
npm run build
```

Production static assets will be emitted to `frontend/dist/`.

---

## API Documentation

FastAPI automatically generates interactive OpenAPI documentation:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/api/health`

### Key Endpoints:
- `GET /api/health` — System and ML model health status.
- `GET /api/regions` — List of 15 Indian meteorological sub-divisions with coordinate centroids.
- `GET /api/risk` — Calibrated bust probability, reliability index, confidence, and SHAP reason codes.
- `GET /api/risk-map` — Geospatial risk dataset across all regions for a chosen lead day.
- `GET /api/forecast/profile` — Day 1 to Day 10 multi-lead trajectory for a specific region.
- `GET /api/verification` — Pointwise error metrics, confusion matrix, and reliability calibration bins.
- `GET /api/model/metrics` — Cross-model benchmark evaluation table and lead-day decay statistics.
- `POST /api/historical-replay` — Historical scenario replay with ground truth comparison.

---

## Docker Deployment

To run the complete full-stack environment in Docker:

```bash
docker compose up --build
```

- **Frontend (Nginx):** `http://localhost:3000`
- **Backend (FastAPI):** `http://localhost:8000`
- **PostgreSQL Database:** `localhost:5432`
