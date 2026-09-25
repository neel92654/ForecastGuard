# ForecastGuard — Data Pipeline & Ingestion Guide

## Data Strategy
ForecastGuard supports dual ingestion modes:
1. **Demonstration Dataset (`DEMO DATA`)**:
   - Spans 91,350 forecast instances across 15 representative Indian meteorological divisions.
   - Initialized daily from 2024-01-01 to 2025-08-31 for Lead Days 1 through 10.
   - Incorporates realistic synoptic monsoon dynamics, orographic rainfall amplification, temperature, 10m wind speed, surface pressure, 2m humidity, spatial gradients, and 11-member NWP ensemble spreads.
2. **External / Operational Data (`EXTERNAL DATA`)**:
   - Designed for seamless ingestion of NetCDF4 / GRIB files from NCMRWF Global Forecast System (NGFS / NEPS) and IMD AWS/gridded observational rain gauges.

## Data Directory Layout
```
data/
├── raw/
│   ├── forecasts/
│   │   └── forecasts_historical.csv
│   └── observations/
│       └── observations_historical.csv
├── processed/
│   └── engineered_verification_dataset.csv
└── demo/
    └── ncmrwf_demo_forecast_history.csv
```

## Verification & Error Formulas
- **Absolute Error (AE)**:
  $$\text{AE} = |F - O|$$
- **Signed Error / Bias**:
  $$\text{Bias} = F - O$$
- **Relative Error (RE)**:
  $$\text{RE} = \frac{|F - O|}{O + \epsilon} \quad (\epsilon = 1.0\text{ mm})$$
- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |F_i - O_i|$$
- **Root Mean Square Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (F_i - O_i)^2}$$

## Context-Aware Bust Thresholding
A forecast bust is defined dynamically based on the historical distribution of forecast errors for that specific region and lead time:
$$\text{Bust Threshold}_{r, d} = \max(10.0\text{ mm}, \text{Percentile}_{90}(\text{AE}_{r, d}))$$
$$\text{is\_bust} = \begin{cases} 1 & \text{if } \text{AE} \ge \text{Bust Threshold}_{r, d} \\ 0 & \text{otherwise} \end{cases}$$
