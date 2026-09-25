"""
End-to-End ML Training Pipeline for ForecastGuard.

Executes:
1. Data Ingestion & Forecast Verification Error Calculation
2. Context-Aware Quantile Bust Label Generation (BUST_PERCENTILE=90)
3. Time-Aware Feature Engineering (Rolling errors, spatial gradients, ensemble spreads)
4. Chronological Train / Val / Test Split (Strictly avoiding temporal lookahead)
5. Multi-Model Training (Logistic Regression, Random Forest, XGBoost)
6. Comprehensive Metric Evaluation (Precision, Recall, F1, ROC-AUC, PR-AUC, Brier Score)
7. Isotonic / Platt Probability Calibration on Validation Set
8. Serialization of Artifacts and Evaluation Reports
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix, brier_score_loss
)

# Add root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config.settings import settings
from backend.services.verification_service import VerificationService
from backend.services.feature_service import FeatureService, FEATURE_COLUMNS
from scripts.generate_demo_data import generate_dataset

def train_pipeline():
    print("=" * 65)
    print(" FORECASTGUARD — AI-BASED FORECAST BUST DETECTION TRAINING PIPELINE ")
    print("=" * 65)
    
    data_file = f"{settings.DATA_DIR}/demo/ncmrwf_demo_forecast_history.csv"
    if not os.path.exists(data_file):
        print(f"Generating realistic meteorological demo dataset at {data_file}...")
        df_raw = generate_dataset(output_dir=settings.DATA_DIR)
    else:
        print(f"Loading existing historical dataset from {data_file}...")
        df_raw = pd.read_csv(data_file)
        
    print(f"Total raw records loaded: {len(df_raw)}")
    
    # 1. Verification & Bust Threshold Computation
    print(f"\n[1] Computing context-aware bust thresholds at {settings.BUST_PERCENTILE}th percentile...")
    thresholds_df = VerificationService.compute_bust_thresholds(
        df_raw, 
        percentile=settings.BUST_PERCENTILE,
        min_threshold_mm=settings.MIN_ERROR_THRESHOLD_MM
    )
    
    # Save thresholds for backend reference
    os.makedirs("models", exist_ok=True)
    thresholds_dict = {}
    for _, row in thresholds_df.iterrows():
        thresholds_dict[f"{row['region']}_D{int(row['lead_day'])}"] = float(row["bust_threshold"])
        
    with open("models/bust_thresholds.json", "w") as f:
        json.dump(thresholds_dict, f, indent=2)
    print(f"Saved {len(thresholds_dict)} regional bust thresholds to models/bust_thresholds.json")
    
    # Apply bust labels
    df_labeled = VerificationService.apply_bust_labels(df_raw, thresholds_df)
    bust_rate = df_labeled["is_bust"].mean()
    print(f"Dataset bust prevalence rate: {bust_rate*100:.2f}% ({df_labeled['is_bust'].sum()} busts / {len(df_labeled)} total)")
    
    # 2. Feature Engineering
    print("\n[2] Engineering temporal, spatial, ensemble, and rolling error features...")
    df_features = FeatureService.engineer_features(df_labeled)
    
    # Drop rows with NaN if any (from rolling warmup)
    df_features = df_features.dropna(subset=FEATURE_COLUMNS + ["is_bust"]).reset_index(drop=True)
    print(f"Feature matrix shape: {df_features[FEATURE_COLUMNS].shape}")
    
    # Save processed feature dataset
    df_features.to_csv(f"{settings.DATA_DIR}/processed/engineered_verification_dataset.csv", index=False)
    
    # 3. Chronological Train / Val / Test Split
    print("\n[3] Splitting dataset chronologically to avoid temporal data leakage...")
    dates = pd.to_datetime(df_features["initialization_time"]).sort_values().unique()
    n_dates = len(dates)
    
    train_cutoff = dates[int(n_dates * 0.60)]
    val_cutoff = dates[int(n_dates * 0.80)]
    
    train_mask = pd.to_datetime(df_features["initialization_time"]) <= train_cutoff
    val_mask = (pd.to_datetime(df_features["initialization_time"]) > train_cutoff) & (pd.to_datetime(df_features["initialization_time"]) <= val_cutoff)
    test_mask = pd.to_datetime(df_features["initialization_time"]) > val_cutoff
    
    train_df = df_features[train_mask]
    val_df = df_features[val_mask]
    test_df = df_features[test_mask]
    
    print(f"  - Train Set : {train_df['initialization_time'].min()} to {train_df['initialization_time'].max()} ({len(train_df)} rows, {train_df['is_bust'].mean()*100:.1f}% busts)")
    print(f"  - Val Set   : {val_df['initialization_time'].min()} to {val_df['initialization_time'].max()} ({len(val_df)} rows, {val_df['is_bust'].mean()*100:.1f}% busts)")
    print(f"  - Test Set  : {test_df['initialization_time'].min()} to {test_df['initialization_time'].max()} ({len(test_df)} rows, {test_df['is_bust'].mean()*100:.1f}% busts)")
    
    X_train, y_train = train_df[FEATURE_COLUMNS], train_df["is_bust"]
    X_val, y_val = val_df[FEATURE_COLUMNS], val_df["is_bust"]
    X_test, y_test = test_df[FEATURE_COLUMNS], test_df["is_bust"]
    
    # 4. Train Models
    print("\n[4] Training Candidate ML Models...")
    
    models = {
        "Logistic Regression (Baseline)": LogisticRegression(max_iter=2000, solver="saga", class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=8, class_weight="balanced", random_state=42, n_jobs=-1),
        "XGBoost (Primary)": XGBClassifier(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.08,
            scale_pos_weight=(len(y_train) - sum(y_train)) / max(1, sum(y_train)),
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1
        )
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"  Training {name}...")
        model.fit(X_train, y_train)
        
        # Test predictions
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_prob)
        pr_auc = average_precision_score(y_test, y_prob)
        brier = brier_score_loss(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "pr_auc": round(float(pr_auc), 4),
            "brier_score": round(float(brier), 4),
            "confusion_matrix": cm
        }
        print(f"    -> Acc: {acc:.3f} | Prec: {prec:.3f} | Rec: {rec:.3f} | F1: {f1:.3f} | ROC-AUC: {roc_auc:.3f} | PR-AUC: {pr_auc:.3f} | Brier: {brier:.4f}")
        
    # 5. Probability Calibration of Primary Model (XGBoost)
    print("\n[5] Fitting Isotonic Probability Calibration on Train Set with 3-Fold Cross-Validation...")
    xgb_base = models["XGBoost (Primary)"]
    
    calibrated_xgb = CalibratedClassifierCV(
        estimator=xgb_base,
        method="isotonic",
        cv=3
    )
    calibrated_xgb.fit(X_train, y_train)
    
    # Test evaluated probabilities
    raw_test_prob = xgb_base.predict_proba(X_test)[:, 1]
    cal_test_prob = calibrated_xgb.predict_proba(X_test)[:, 1]
    
    raw_brier = brier_score_loss(y_test, raw_test_prob)
    cal_brier = brier_score_loss(y_test, cal_test_prob)
    
    print(f"  Raw XGBoost Brier Score        : {raw_brier:.4f}")
    print(f"  Calibrated XGBoost Brier Score : {cal_brier:.4f} (Lower is better)")
    
    # Calibration curves (5 bins)
    prob_true, prob_pred = calibration_curve(y_test, cal_test_prob, n_bins=5, strategy="uniform")
    calibration_points = [
        {"predicted": round(float(p), 3), "observed": round(float(o), 3)}
        for p, o in zip(prob_pred, prob_true)
    ]
    
    # Final test metrics for Calibrated XGBoost
    cal_pred = (cal_test_prob >= 0.5).astype(int)
    calibrated_metrics = {
        "accuracy": round(float(accuracy_score(y_test, cal_pred)), 4),
        "precision": round(float(precision_score(y_test, cal_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, cal_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, cal_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, cal_test_prob)), 4),
        "pr_auc": round(float(average_precision_score(y_test, cal_test_prob)), 4),
        "raw_brier_score": round(float(raw_brier), 4),
        "brier_score": round(float(cal_brier), 4),
        "confusion_matrix": confusion_matrix(y_test, cal_pred).tolist(),
        "calibration_curve": calibration_points,
        "test_records_count": len(y_test),
        "test_bust_count": int(y_test.sum())
    }
    
    # 6. Aggregate Error Verification Metrics (MAE, RMSE, Bias by Lead Day)
    verification_summary = {}
    for lead in range(1, 11):
        lead_sub = df_features[df_features["lead_day"] == lead]
        f_vals = lead_sub["rainfall_forecast"].values
        o_vals = lead_sub["rainfall_observed"].values
        metrics = VerificationService.compute_bulk_metrics(f_vals, o_vals)
        metrics["bust_rate"] = round(float(lead_sub["is_bust"].mean()), 3)
        verification_summary[f"Day_{lead}"] = metrics
        
    overall_bulk = VerificationService.compute_bulk_metrics(
        df_features["rainfall_forecast"].values,
        df_features["rainfall_observed"].values
    )
    
    # 7. Metadata and Artifact Export
    metadata = {
        "model_version": "ForecastGuard-v1.0-XGBoost-Calibrated",
        "algorithm": "XGBoost + Isotonic CalibratedClassifierCV",
        "calibration_method": "Isotonic Regression",
        "training_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "training_dataset": "DEMO DATA (Indian Meteorological Historical Replay)",
        "features": FEATURE_COLUMNS,
        "bust_percentile": settings.BUST_PERCENTILE,
        "min_error_threshold_mm": settings.MIN_ERROR_THRESHOLD_MM,
        "models_comparison": results,
        "primary_model_metrics": calibrated_metrics,
        "verification_summary": verification_summary,
        "overall_verification": overall_bulk,
        "status": "PROTOTYPE_TRAINED"
    }
    
    # Save model artifact
    bundle = {
        "model": calibrated_xgb,
        "base_model": xgb_base,
        "metadata": metadata,
        "features": FEATURE_COLUMNS
    }
    joblib.dump(bundle, settings.MODEL_PATH)
    print(f"\n[6] Saved calibrated model bundle to {settings.MODEL_PATH}")
    
    # Save standalone metrics.json for API consumption
    with open("models/metrics.json", "w") as f:
        json.dump(metadata, f, indent=2)
    print("Saved comprehensive evaluation metrics to models/metrics.json")
    
    print("\n" + "=" * 65)
    print(" TRAINING COMPLETE — FORECASTGUARD READY FOR INFERENCE ")
    print("=" * 65)

if __name__ == "__main__":
    train_pipeline()
