"""
Realistic Demonstration Meteorological Data Generator for ForecastGuard.

Generates internally consistent medium-range forecasts (Lead Day 1 to 10),
ground-truth observations, spatial variations across Indian sub-divisions,
and historical error distributions with meteorological integrity.

All data generated is explicitly marked as 'DEMO DATA'.
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# List of Indian Meteorological Divisions / States with representative centroid coordinates
INDIAN_REGIONS = [
    {"name": "Gujarat", "lat": 22.2587, "lon": 71.1924, "zone": "West", "climate": "Semi-Arid/Coastal", "base_rain": 18.0},
    {"name": "Maharashtra", "lat": 19.7515, "lon": 75.7139, "zone": "West-Central", "climate": "Ghats/Plateau", "base_rain": 24.0},
    {"name": "Kerala", "lat": 10.8505, "lon": 76.2711, "zone": "South", "climate": "Tropical Wet", "base_rain": 35.0},
    {"name": "Rajasthan", "lat": 27.0238, "lon": 74.2179, "zone": "Northwest", "climate": "Arid", "base_rain": 10.0},
    {"name": "Odisha", "lat": 20.9517, "lon": 85.0985, "zone": "East", "climate": "Coastal/Depression Track", "base_rain": 28.0},
    {"name": "Assam", "lat": 26.2006, "lon": 92.9376, "zone": "Northeast", "climate": "Subtropical Humid", "base_rain": 38.0},
    {"name": "Punjab", "lat": 31.1471, "lon": 75.3412, "zone": "North", "climate": "Subtropical", "base_rain": 14.0},
    {"name": "Tamil Nadu", "lat": 11.1271, "lon": 78.6569, "zone": "South", "climate": "Rain-Shadow / NEM", "base_rain": 22.0},
    {"name": "Andhra Pradesh", "lat": 15.9129, "lon": 79.7400, "zone": "South-East", "climate": "Coastal Wet-Dry", "base_rain": 22.0},
    {"name": "West Bengal", "lat": 22.9868, "lon": 87.8550, "zone": "East", "climate": "Gangetic Delta", "base_rain": 30.0},
    {"name": "Madhya Pradesh", "lat": 22.9734, "lon": 78.6569, "zone": "Central", "climate": "Monsoon Trough", "base_rain": 25.0},
    {"name": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "zone": "North", "climate": "Gangetic Plain", "base_rain": 20.0},
    {"name": "Karnataka", "lat": 15.3173, "lon": 75.7139, "zone": "South", "climate": "Plateau / Coastal", "base_rain": 26.0},
    {"name": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734, "zone": "North-Himalayan", "climate": "Montane", "base_rain": 22.0},
    {"name": "Bihar", "lat": 25.0961, "lon": 85.3131, "zone": "East", "climate": "Gangetic Plain", "base_rain": 25.0},
]

def get_season_factor(date: datetime, region_name: str) -> float:
    """Computes Indian monsoon seasonality factor."""
    month = date.month
    day_of_year = date.timetuple().tm_yday
    
    # Tamil Nadu gets peak rainfall during Northeast Monsoon (Oct-Dec)
    if region_name == "Tamil Nadu":
        if month in [10, 11, 12]:
            return 2.5
        elif month in [6, 7, 8, 9]:
            return 0.8
        else:
            return 0.4
            
    # Southwest Monsoon (June 1 - Sept 30) for rest of India
    if 6 <= month <= 9:
        # Peak monsoon in July-August
        if month in [7, 8]:
            return 2.8
        return 2.0
    elif month in [4, 5]: # Pre-monsoon thunderstorms
        return 0.9
    elif month in [10, 11]: # Post-monsoon
        return 0.6
    else: # Winter dry season
        return 0.3

def generate_dataset(start_date="2024-01-01", end_date="2025-08-31", output_dir="data"):
    """
    Generates synthetic daily forecast and observation series for 15 Indian regions,
    with lead times 1 to 10 days, realistic error distributions, spatial correlations,
    and ensemble dispersion.
    """
    np.random.seed(42)
    os.makedirs(f"{output_dir}/raw/forecasts", exist_ok=True)
    os.makedirs(f"{output_dir}/raw/observations", exist_ok=True)
    os.makedirs(f"{output_dir}/demo", exist_ok=True)
    os.makedirs(f"{output_dir}/processed", exist_ok=True)
    
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    total_days = (end - start).days + 1
    
    dates = [start + timedelta(days=i) for i in range(total_days)]
    
    records = []
    
    # Track historical regional errors for rolling metrics
    region_history = {r["name"]: [] for r in INDIAN_REGIONS}
    
    for init_idx, init_date in enumerate(dates):
        # Synoptic pattern perturbation for the day across India (e.g., monsoon low, western disturbance)
        synoptic_instability = np.random.beta(2, 5) # 0.0 to 1.0
        
        for region in INDIAN_REGIONS:
            r_name = region["name"]
            lat = region["lat"]
            lon = region["lon"]
            base_rain = region["base_rain"]
            season_factor = get_season_factor(init_date, r_name)
            
            # Baseline meteorological climate for this day
            mean_rain = base_rain * season_factor * (0.6 + 0.8 * np.random.rand())
            
            # 1 to 10 Day Forecasts initialized on init_date
            for lead in range(1, 11):
                valid_date = init_date + timedelta(days=lead)
                
                # Meteorological properties
                # Temperature: cooler in monsoon/winter, hotter in pre-monsoon
                base_temp = 28.0 - (season_factor * 2.5) + np.sin(init_date.timetuple().tm_yday / 365.0 * 2 * np.pi - 1.5) * 6.0
                fcst_temp = round(float(base_temp + np.random.normal(0, 0.4 * np.sqrt(lead))), 1)
                
                # Wind speed: higher during monsoon and cyclones
                base_wind = 12.0 * season_factor + 8.0
                fcst_wind = round(max(2.0, float(base_wind + np.random.normal(0, 0.8 * np.sqrt(lead)))), 1)
                
                # Surface pressure (hPa)
                base_pres = 1008.0 - (season_factor * 6.0)
                fcst_pres = round(float(base_pres + np.random.normal(0, 0.5 * np.sqrt(lead))), 1)
                
                # Humidity (%)
                base_hum = min(98.0, max(30.0, 50.0 + season_factor * 18.0))
                fcst_hum = round(float(np.clip(base_hum + np.random.normal(0, 1.2 * np.sqrt(lead)), 15.0, 99.0)), 1)
                
                # Forecast rainfall generation (Gamma distributed rain event probability)
                is_rain_day = np.random.rand() < min(0.85, 0.25 * season_factor + synoptic_instability * 0.3)
                if is_rain_day:
                    shape_k = 1.5
                    scale_theta = mean_rain / shape_k
                    raw_fcst_rain = np.random.gamma(shape_k, scale_theta)
                else:
                    raw_fcst_rain = 0.0
                
                fcst_rain = round(float(raw_fcst_rain), 1)
                
                # Uncertainty growth with lead time
                # Dispersion error grows as lead^1.2
                lead_uncertainty = (lead ** 1.15) * 0.22
                
                # Simulated observation with occasional convective burst / displacement error
                # Bust scenario occurs when convective triggering fails, monsoon depression shifts, or orographic amplification explodes
                is_bust_trigger = (np.random.rand() < (0.08 + 0.02 * lead + 0.12 * synoptic_instability)) and (fcst_rain > 8.0 or season_factor > 1.5)
                
                if is_bust_trigger:
                    # High error: severe overprediction or severe underprediction
                    if np.random.rand() < 0.55: # False alarm / overforecast
                        obs_rain = max(0.0, fcst_rain * np.random.uniform(0.05, 0.35) - np.random.exponential(3.0))
                    else: # Missed extreme event / underforecast
                        obs_rain = fcst_rain + np.random.uniform(35.0, 90.0) + (lead * 3.5)
                else:
                    # Normal forecast error distribution
                    error_noise = np.random.normal(0, max(2.0, fcst_rain * 0.18 + lead_uncertainty * 3.0))
                    obs_rain = max(0.0, fcst_rain + error_noise)
                    
                obs_rain = round(float(obs_rain), 1)
                
                # Observed other variables with slight realistic deviation
                obs_temp = round(float(fcst_temp + np.random.normal(0, 0.5 + 0.15 * lead)), 1)
                obs_wind = round(max(1.0, float(fcst_wind + np.random.normal(0, 1.0 + 0.2 * lead))), 1)
                obs_pres = round(float(fcst_pres + np.random.normal(0, 0.4 + 0.1 * lead)), 1)
                obs_hum = round(float(np.clip(fcst_hum + np.random.normal(0, 2.0 + 0.4 * lead), 10.0, 100.0)), 1)
                
                # Verification errors
                abs_err = round(abs(fcst_rain - obs_rain), 2)
                signed_err = round(fcst_rain - obs_rain, 2)
                rel_err = round(abs_err / (obs_rain + 1.0), 3)
                
                # Ensemble statistics (Simulating an 11-member NWP ensemble, e.g. NCMRWF NEPS)
                ens_spread = round(float(max(1.5, lead_uncertainty * 4.0 + (abs_err * 0.4 * np.random.uniform(0.6, 1.4)))), 2)
                ens_mean = round(float(fcst_rain + np.random.normal(0, ens_spread * 0.25)), 1)
                ens_min = max(0.0, round(float(ens_mean - ens_spread * 1.8), 1))
                ens_max = round(float(ens_mean + ens_spread * 2.2), 1)
                
                # Spatial variability proxy (gradient with neighboring atmospheric state)
                spatial_var = round(float(np.random.gamma(2.0, max(1.5, fcst_rain * 0.15 + lead * 0.8))), 2)
                
                rec = {
                    "forecast_id": f"FCST_{init_date.strftime('%Y%m%d')}_{r_name[:3].upper()}_D{lead}",
                    "initialization_time": init_date.strftime("%Y-%m-%d"),
                    "valid_time": valid_date.strftime("%Y-%m-%d"),
                    "region": r_name,
                    "zone": region["zone"],
                    "latitude": lat,
                    "longitude": lon,
                    "lead_day": lead,
                    "rainfall_forecast": fcst_rain,
                    "rainfall_observed": obs_rain,
                    "temperature_forecast": fcst_temp,
                    "temperature_observed": obs_temp,
                    "wind_forecast": fcst_wind,
                    "wind_observed": obs_wind,
                    "pressure_forecast": fcst_pres,
                    "pressure_observed": obs_pres,
                    "humidity_forecast": fcst_hum,
                    "humidity_observed": obs_hum,
                    "absolute_error": abs_err,
                    "signed_error": signed_err,
                    "relative_error": rel_err,
                    "ensemble_mean": ens_mean,
                    "ensemble_spread": ens_spread,
                    "ensemble_min": ens_min,
                    "ensemble_max": ens_max,
                    "spatial_variability": spatial_var,
                    "data_source": "DEMO DATA",
                    "variable": "rainfall"
                }
                records.append(rec)
    
    df = pd.DataFrame(records)
    
    # Save raw forecast, observation, and unified demo datasets
    df.to_csv(f"{output_dir}/demo/ncmrwf_demo_forecast_history.csv", index=False)
    
    # Split into raw forecasts and raw observations for realistic ingestion simulation
    fcst_cols = ["forecast_id", "initialization_time", "valid_time", "region", "zone", "latitude", "longitude", 
                 "lead_day", "rainfall_forecast", "temperature_forecast", "wind_forecast", "pressure_forecast", 
                 "humidity_forecast", "ensemble_mean", "ensemble_spread", "ensemble_min", "ensemble_max", "spatial_variability"]
    df[fcst_cols].to_csv(f"{output_dir}/raw/forecasts/forecasts_historical.csv", index=False)
    
    obs_cols = ["valid_time", "region", "latitude", "longitude", "rainfall_observed", "temperature_observed", 
                "wind_observed", "pressure_observed", "humidity_observed"]
    # Drop duplicates for observations on same valid_date & region
    df_obs = df[obs_cols].drop_duplicates(subset=["valid_time", "region"])
    df_obs["observation_id"] = [f"OBS_{row.valid_time.replace('-', '')}_{row.region[:3].upper()}" for _, row in df_obs.iterrows()]
    df_obs.to_csv(f"{output_dir}/raw/observations/observations_historical.csv", index=False)
    
    print(f"Generated {len(df)} forecast records across {len(INDIAN_REGIONS)} regions from {start_date} to {end_date}.")
    print(f"Saved demo dataset to {output_dir}/demo/ncmrwf_demo_forecast_history.csv")
    return df

if __name__ == "__main__":
    generate_dataset()
