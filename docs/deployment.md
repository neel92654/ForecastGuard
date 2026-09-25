# ForecastGuard — Deployment Guide

## Production Architecture
- **Frontend**: Static Nginx container or Vercel / Cloudflare Pages.
- **Backend**: Python 3.11 FastAPI container running behind Uvicorn / Gunicorn.
- **Database**: PostgreSQL 16 managed cluster.
- **ML Artifacts**: Containerized `.joblib` model bundles mounted at `/app/models`.

---

## 1. Docker Compose Deployment (Single Command)

### Prerequisites
- Docker Engine $\ge 24.0$
- Docker Compose v2

### Steps
```bash
# Clone and enter directory
cd ForecastGuard

# Build and launch PostgreSQL, Backend, and Frontend containers
docker compose up --build -d

# Verify running containers
docker compose ps
```

### Endpoints
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

## 2. Local Bare-Metal / Development Deployment

### Backend Setup
```bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train models and generate verification dataset (if not trained)
python scripts/train_model.py

# 4. Start FastAPI server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```

### Running Automated Test Suite
```bash
pytest
```
