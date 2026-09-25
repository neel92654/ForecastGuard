import React, { useState, useEffect } from 'react';
import { fetchVerification, fetchModelMetrics } from '../services/api';
import { BarChart3, Award, TrendingUp, Info, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Verification() {
  const [verificationData, setVerificationData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const [vRes, mRes] = await Promise.all([
          fetchVerification(),
          fetchModelMetrics(),
        ]);
        setVerificationData(vRes);
        setModelMetrics(mRes);
      } catch (err) {
        console.error('Failed to load verification metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-[1560px] mx-auto space-y-5 animate-pulse pb-10">
        <div className="card-panel h-24 bg-[var(--surface-1)]"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-panel h-24 bg-[var(--surface-1)]"></div>
          ))}
        </div>
      </div>
    );
  }

  const prim = modelMetrics?.primary_model_metrics || {};
  const overall = verificationData?.overall_verification || {};
  const leadSummary = verificationData?.lead_day_summary || {};
  const comparison = modelMetrics?.models_comparison || {};
  const cm = prim.confusion_matrix || [[14295, 300], [439, 3116]];

  const kpis = [
    { label: 'Bust Precision', value: `${((prim.precision || 0.912) * 100).toFixed(1)}%`, desc: 'True positives / predicted' },
    { label: 'Bust Recall', value: `${((prim.recall || 0.876) * 100).toFixed(1)}%`, desc: 'Captured bust events' },
    { label: 'F1-Score', value: `${((prim.f1_score || 0.894) * 100).toFixed(1)}%`, desc: 'Harmonic mean' },
    { label: 'ROC-AUC', value: (prim.roc_auc || 0.991).toFixed(3), desc: 'Bust discrimination' },
    { label: 'PR-AUC', value: (prim.pr_auc || 0.969).toFixed(3), desc: 'Precision-recall AUC' },
    { label: 'Brier Score', value: (prim.brier_score || 0.0288).toFixed(4), desc: 'Calibrated prob error' },
    { label: 'Overall MAE', value: `${overall.mae || 9.19} mm`, desc: 'Mean absolute error' },
    { label: 'Overall RMSE', value: `${overall.rmse || 23.15} mm`, desc: 'Root mean square error' },
  ];

  const benchmarkRows = [
    {
      name: 'Logistic Regression (Baseline)',
      acc: comparison['Logistic Regression (Baseline)']?.accuracy ?? 0.931,
      prec: comparison['Logistic Regression (Baseline)']?.precision ?? 0.752,
      rec: comparison['Logistic Regression (Baseline)']?.recall ?? 0.966,
      f1: comparison['Logistic Regression (Baseline)']?.f1_score ?? 0.845,
      roc: comparison['Logistic Regression (Baseline)']?.roc_auc ?? 0.989,
      pr: comparison['Logistic Regression (Baseline)']?.pr_auc ?? 0.963,
      brier: comparison['Logistic Regression (Baseline)']?.brier_score ?? 0.0536,
      status: 'Benchmark',
      isDeployed: false,
    },
    {
      name: 'Random Forest',
      acc: comparison['Random Forest']?.accuracy ?? 0.870,
      prec: comparison['Random Forest']?.precision ?? 0.604,
      rec: comparison['Random Forest']?.recall ?? 0.973,
      f1: comparison['Random Forest']?.f1_score ?? 0.745,
      roc: comparison['Random Forest']?.roc_auc ?? 0.979,
      pr: comparison['Random Forest']?.pr_auc ?? 0.933,
      brier: comparison['Random Forest']?.brier_score ?? 0.0923,
      status: 'Benchmark',
      isDeployed: false,
    },
    {
      name: 'XGBoost — Raw',
      acc: comparison['XGBoost (Primary)']?.accuracy ?? 0.930,
      prec: comparison['XGBoost (Primary)']?.precision ?? 0.746,
      rec: comparison['XGBoost (Primary)']?.recall ?? 0.976,
      f1: comparison['XGBoost (Primary)']?.f1_score ?? 0.845,
      roc: comparison['XGBoost (Primary)']?.roc_auc ?? 0.991,
      pr: comparison['XGBoost (Primary)']?.pr_auc ?? 0.970,
      brier: prim.raw_brier_score ?? 0.0485,
      status: 'Pre-Calibration',
      isDeployed: false,
    },
    {
      name: 'XGBoost — Isotonic Calibrated',
      acc: prim.accuracy ?? 0.959,
      prec: prim.precision ?? 0.912,
      rec: prim.recall ?? 0.876,
      f1: prim.f1_score ?? 0.894,
      roc: prim.roc_auc ?? 0.991,
      pr: prim.pr_auc ?? 0.969,
      brier: prim.brier_score ?? 0.0288,
      status: 'PRIMARY PROTOTYPE MODEL',
      isDeployed: true,
    },
  ];

  // Calibration curve bins (Empirical vs Predicted)
  const calBins = [
    { bin: 'Bin 1', pred: 0.01, obs: 0.01, count: 12400 },
    { bin: 'Bin 2', pred: 0.29, obs: 0.26, count: 1850 },
    { bin: 'Bin 3', pred: 0.49, obs: 0.48, count: 1220 },
    { bin: 'Bin 4', pred: 0.70, obs: 0.67, count: 1180 },
    { bin: 'Bin 5', pred: 0.97, obs: 0.98, count: 1500 },
  ];

  return (
    <div className="verification-page">
      {/* Header Banner */}
      <div className="card-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-[var(--accent-cyan)]" />
              <h2 className="page-title">
                Forecast Verification Analytics
              </h2>
            </div>
            <p className="body-text text-xs max-w-3xl">
              Chronological holdout evaluation of forecast-bust detection and probability calibration across all meteorological divisions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[#FBBF24]">
              DEMONSTRATION DATA
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--accent-cyan)]">
              HOLDOUT (18,150 RECORDS)
            </span>
          </div>
        </div>
      </div>

      {/* 8 Compact KPI Cards (Aligned Height & Number Baselines) */}
      <div className="verification-kpis-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card-panel p-3 flex flex-col justify-between" style={{ minHeight: '92px' }}>
            <span className="micro-label text-[10px] text-[var(--text-muted)] truncate block">
              {kpi.label}
            </span>
            <div className="kpi-secondary text-lg font-bold text-[var(--text-primary)] my-0.5 font-mono">
              {kpi.value}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] truncate">
              {kpi.desc}
            </span>
          </div>
        ))}
      </div>

      {/* 55/45 Calibration Curve & Confusion Matrix */}
      <div className="verification-eval-grid">
        {/* Left (55%): Probability Calibration Reliability Diagram */}
        <div className="card-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-cyan)]" />
                <h3 className="card-title-text m-0">
                  Probability Calibration Curve (Reliability Diagram)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[var(--accent-cyan)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                Brier Score: {prim.brier_score || 0.0288}
              </span>
            </div>

            {/* Visual SVG Calibration Chart */}
            <div className="py-2">
              <div className="relative h-44 w-full bg-[var(--surface-2)] rounded border border-[var(--border-subtle)] p-3 flex flex-col justify-between">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 130">
                  {/* Grid Lines */}
                  <line x1="40" y1="10" x2="380" y2="10" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="40" y1="40" x2="380" y2="40" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="380" y2="100" stroke="var(--border-subtle)" />

                  {/* Axes */}
                  <line x1="40" y1="10" x2="40" y2="100" stroke="var(--border)" />
                  <line x1="40" y1="100" x2="380" y2="100" stroke="var(--border)" />

                  {/* Ideal Calibration Diagonal (Dashed) */}
                  <line x1="40" y1="100" x2="380" y2="10" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Actual Empirical Curve */}
                  <polyline
                    fill="none"
                    stroke="var(--accent-cyan)"
                    strokeWidth="2.5"
                    points="44,99 138,76 206,56 278,39 370,12"
                  />

                  {/* Data Points */}
                  <circle cx="44" cy="99" r="4" fill="var(--accent-cyan)" />
                  <circle cx="138" cy="76" r="4" fill="var(--accent-cyan)" />
                  <circle cx="206" cy="56" r="4" fill="var(--accent-cyan)" />
                  <circle cx="278" cy="39" r="4" fill="var(--accent-cyan)" />
                  <circle cx="370" cy="12" r="4" fill="var(--accent-cyan)" />

                  {/* Y Axis Labels */}
                  <text x="32" y="14" fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">1.0</text>
                  <text x="32" y="58" fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">0.5</text>
                  <text x="32" y="102" fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="monospace">0.0</text>

                  {/* X Axis Labels */}
                  <text x="44" y="115" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">0.0</text>
                  <text x="210" y="115" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">0.5</text>
                  <text x="370" y="115" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="monospace">1.0</text>
                </svg>
              </div>
            </div>

            {/* Bin Details */}
            <div className="grid grid-cols-5 gap-1.5 mt-2 text-[10px] font-mono text-center">
              {calBins.map((b, i) => (
                <div key={i} className="p-1.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] block">{b.bin}</span>
                  <span className="text-[var(--text-primary)] font-bold block">{(b.pred * 100).toFixed(0)}% &rarr; {(b.obs * 100).toFixed(0)}%</span>
                  <span className="text-[9px] text-[var(--text-muted)]">{b.count} cases</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] flex justify-between mt-2">
            <span>Isotonic calibration aligns predicted bust risk with true empirical frequency.</span>
            <span className="text-[var(--accent-cyan)] font-mono">Brier Reduction: 40.6%</span>
          </div>
        </div>

        {/* Right (45%): Structured 2x2 Confusion Matrix */}
        <div className="card-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-cyan)]" />
                <h3 className="card-title-text m-0">
                  Holdout Confusion Matrix
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                18,150 Cases Total
              </span>
            </div>

            <div className="my-2">
              <div className="grid grid-cols-2 gap-2 text-center">
                {/* True Negatives */}
                <div className="p-3 rounded bg-[var(--surface-2)] border border-[rgba(34,197,94,0.3)]">
                  <span className="micro-label text-[10px] text-[#4ADE80] block">TRUE NEGATIVES</span>
                  <div className="text-xl font-bold font-mono text-[var(--text-primary)] my-0.5">
                    {cm[0]?.[0] ?? 14295}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Correct Non-Busts</span>
                </div>

                {/* False Positives */}
                <div className="p-3 rounded bg-[var(--surface-2)] border border-[rgba(245,158,11,0.3)]">
                  <span className="micro-label text-[10px] text-[#FBBF24] block">FALSE POSITIVES</span>
                  <div className="text-xl font-bold font-mono text-[var(--text-primary)] my-0.5">
                    {cm[0]?.[1] ?? 300}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">False Alarms</span>
                </div>

                {/* False Negatives */}
                <div className="p-3 rounded bg-[var(--surface-2)] border border-[rgba(239,68,68,0.3)]">
                  <span className="micro-label text-[10px] text-[#F87171] block">FALSE NEGATIVES</span>
                  <div className="text-xl font-bold font-mono text-[var(--text-primary)] my-0.5">
                    {cm[1]?.[0] ?? 439}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Missed Busts</span>
                </div>

                {/* True Positives */}
                <div className="p-3 rounded bg-[var(--surface-2)] border border-[rgba(34,199,232,0.4)]">
                  <span className="micro-label text-[10px] text-[var(--accent-cyan)] block">TRUE POSITIVES</span>
                  <div className="text-xl font-bold font-mono text-[var(--text-primary)] my-0.5">
                    {cm[1]?.[1] ?? 3116}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Detected Busts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] flex justify-between mt-2">
            <span>High recall (87.6%) prioritizes actionable warning over missed busts.</span>
            <span className="text-[var(--accent-cyan)] font-mono">Precision: 91.2%</span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Table */}
      <div className="card-panel overflow-x-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="card-title-text m-0">
              Comparative Candidate Model Benchmark (Holdout Test Set)
            </h3>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            Calibration improves probability reliability (Brier Score)
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Model Architecture</th>
              <th className="num">Accuracy</th>
              <th className="num">Precision</th>
              <th className="num">Recall</th>
              <th className="num">F1-Score</th>
              <th className="num">ROC-AUC</th>
              <th className="num">PR-AUC</th>
              <th className="num">Brier Score</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkRows.map((m) => (
              <tr key={m.name} className={m.isDeployed ? 'selected' : ''}>
                <td className="font-sans font-medium text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    {m.name}
                    {m.isDeployed && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--accent-cyan)] text-[#060B16] uppercase font-bold font-mono">
                        Selected
                      </span>
                    )}
                  </div>
                </td>
                <td className="num">{(m.acc * 100).toFixed(1)}%</td>
                <td className="num">{(m.prec * 100).toFixed(1)}%</td>
                <td className="num text-[#4ADE80]">{(m.rec * 100).toFixed(1)}%</td>
                <td className="num">{(m.f1 * 100).toFixed(1)}%</td>
                <td className="num">{m.roc}</td>
                <td className="num">{m.pr}</td>
                <td className="num text-[var(--accent-cyan)] font-bold">{m.brier}</td>
                <td>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    m.isDeployed ? 'bg-[var(--surface-3)] text-[var(--accent-cyan)] border border-[var(--border-focus)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Day 1 to Day 10 Verification Table (Compact Table Redesign) */}
      <div className="card-panel overflow-x-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="card-title-text m-0">
              Forecast Error &amp; Bust Frequency Decay by Lead Day (Day 1 to 10)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            91,350 Evaluation Forecast Records
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Lead Day Horizon</th>
              <th className="num">Mean Absolute Error (MAE)</th>
              <th className="num">Root Mean Sq. Error (RMSE)</th>
              <th className="num">Mean Bias Error</th>
              <th className="num">Empirical Bust Rate</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(leadSummary).map(([k, stats]) => {
              const dayNum = parseInt(k.replace(/day_/i, ''), 10) || 1;
              return (
                <tr key={k}>
                  <td className="font-mono font-bold text-[var(--accent-cyan)]">
                    Day {dayNum} (+{dayNum * 24}h)
                  </td>
                  <td className="num text-[var(--text-primary)] font-bold">{stats.mae} mm</td>
                  <td className="num text-[var(--text-secondary)]">{stats.rmse} mm</td>
                  <td className="num text-[var(--text-secondary)]">{stats.bias} mm</td>
                  <td className="num text-[#FBBF24] font-bold">{((stats.bust_rate || 0.1) * 100).toFixed(0)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
