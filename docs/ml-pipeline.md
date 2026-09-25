# ForecastGuard — Machine Learning Pipeline

## ML Architecture & Objective
The ForecastGuard ML engine evaluates medium-range forecasts to classify whether a given forecast cycle will result in an operational bust ($Y \in \{0, 1\}$) and outputs a well-calibrated posterior probability $P(\text{Bust} \mid X)$.

## Feature Schema (20 Engineered Signals)
1. **Forecast Properties**: `lead_day`, `rainfall_forecast`, `temperature_forecast`, `wind_forecast`, `pressure_forecast`, `humidity_forecast`
2. **Ensemble Dynamics**: `ensemble_spread`, `ensemble_mean`, `ens_spread_to_mean_ratio`
3. **Spatial Gradient**: `spatial_variability`
4. **Historical Error Signals (7-Day Rolling)**: `rolling_mae_7d`, `rolling_rmse_7d`, `rolling_bias_7d`, `previous_error`, `historical_bust_rate`
5. **Temporal & Synoptic Markers**: `month`, `day_of_year`, `sin_doy`, `cos_doy`, `is_monsoon`

## Validation Strategy
- Chronological split to prevent temporal lookahead:
  - **Train Set**: 2024-01-01 to 2024-12-31 (54,900 instances)
  - **Validation Set**: 2025-01-01 to 2025-05-02 (18,300 instances)
  - **Holdout Test Set**: 2025-05-03 to 2025-08-31 (18,150 instances)

## Evaluation Benchmark

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | PR-AUC | Brier Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** (Baseline) | 93.1% | 75.2% | 96.6% | 84.5% | 0.989 | 0.963 | 0.0536 |
| **Random Forest** | 87.0% | 60.4% | 97.3% | 74.5% | 0.979 | 0.933 | 0.0923 |
| **XGBoost (Raw)** | 93.0% | 74.6% | 97.6% | 84.5% | 0.991 | 0.970 | 0.0485 |
| **XGBoost (Isotonic Calibrated)** | **93.0%** | **74.6%** | **97.6%** | **84.5%** | **0.991** | **0.970** | **0.0288** |

## Probability Calibration
Probability calibration transforms raw model logits into empirical observed likelihoods. Using 3-fold cross-validated Isotonic Regression, the Brier Score improved from `0.0485` to `0.0288`.

## TreeSHAP Explainability & Reason Code Mapping
For every forecast prediction, TreeSHAP attributes local feature contributions. These numerical values are mapped into meteorological reason cards:
- `HIGH_HISTORICAL_ERROR`: Spikes in 7-day rolling RMSE.
- `HIGH_ENSEMBLE_SPREAD`: Divergence across NWP ensemble members.
- `LONG_LEAD_TIME`: Lead horizon decay ($\ge \text{Day 5}$).
- `HIGH_SPATIAL_VARIABILITY`: Steep precipitation gradient with neighboring zones.
- `HEAVY_PRECIPITATION_ANOMALY`: Extreme forecasted rainfall volume.
- `MONSOON_DYNAMICS`: Southwest/Northeast monsoon convective regime instability.
