# ForecastGuard — 2-3 Minute SIH Judge Demonstration Script

## Problem Statement
**SIH26079**: AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts
**Organization**: Ministry of Earth Sciences (MoES) / NCMRWF

---

## 30-Second Elevator Pitch
> *"ForecastGuard does not attempt to replace India's Numerical Weather Prediction (NWP) systems. Instead, it acts as an intelligent machine learning reliability layer. By learning from historical forecast verification errors, ensemble spread, and spatial gradients, ForecastGuard estimates exactly where and when medium-range forecasts are likely to experience unusually large errors ('busts')."*

---

## Step-by-Step Live Demo Flow (2.5 Minutes)

### Step 1: Open Operations Dashboard (40 seconds)
1. **Show Top Bar**: Point to `MoES / NCMRWF` branding, `SYSTEM ONLINE`, and `[ DEMO DATA ]` badge.
2. **Select Region**: Choose **`Gujarat`** & Lead Time **`Day 5`**.
3. **Show Bust Risk**: Point out the **Calibrated Bust Probability** (e.g. ~78%) and **LOW CONFIDENCE** score.
4. **Show Real Interactive Map**: Zoom into India's map, click on different state markers (e.g. Maharashtra, Odisha, Rajasthan), and show how probabilities update dynamically from the FastAPI backend.
5. **Inspect Why**: Direct judges to **"WHY IS THIS FORECAST AT RISK?"** panel showing TreeSHAP-derived meteorological reason cards (e.g., High Historical RMSE, Heavy Forecast Magnitude, Long Lead Time).

---

### Step 2: Run Historical Forecast Replay (60 seconds)
1. Click navigation tab **`Historical Replay`**.
2. Click the preset quick-pick card: **`Monsoon Convective Bust — Gujarat (Day 5)`**.
3. Click **`RUN HISTORICAL REPLAY`**.
4. Highlight the live end-to-end outcome:
   - **Forecast**: $84\text{ mm}$
   - **Ground Truth Observation**: $39\text{ mm}$
   - **Absolute Error**: $45\text{ mm}$ (Exceeded $32.5\text{ mm}$ regional threshold)
   - **ForecastGuard Predicted Bust Risk**: $81\%$
   - **Result**: $\text{VALIDATED} \rightarrow \text{True Positive Alert}$
5. Explain to judges: *"ForecastGuard successfully flagged this forecast as high-risk before ground observations were recorded."*

---

### Step 3: Inspect Verification Analytics & Calibration (40 seconds)
1. Click navigation tab **`Verification Analytics`**.
2. Show the multi-model comparison table:
   - Baseline Logistic Regression ($F_1 = 84.5\%$)
   - Random Forest ($F_1 = 74.5\%$)
   - **Calibrated XGBoost** ($F_1 = 84.5\%$, $\text{Recall} = 97.6\%$, $\text{ROC-AUC} = 0.991$, $\text{PR-AUC} = 0.970$).
3. Point to the **Reliability Diagram (Calibration Curve)** and **Brier Score improvement** ($0.0485 \rightarrow 0.0288$).
4. Conclude: *"All metrics are computed from real chronological holdout tests without lookahead bias."*
