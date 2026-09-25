import React, { useState, useRef } from 'react';
import { runHistoricalReplay } from '../services/api';
import { Play, RotateCcw, CheckCircle2, AlertTriangle, HelpCircle, Sparkles, Clock, Calendar, MapPin, ChevronDown, ChevronUp, Cpu, ArrowRight } from 'lucide-react';

const QUICK_CASES = [
  {
    title: 'Monsoon Convective Bust — Gujarat',
    date: '2025-08-15',
    region: 'Gujarat',
    leadDay: 5,
    tag: 'EXTREME OVERFORECAST',
    desc: 'Deep monsoon depression where localized convective triggering overpredicted rainfall volume.',
  },
  {
    title: 'Depression Track Shift — Odisha',
    date: '2025-07-22',
    region: 'Odisha',
    leadDay: 6,
    tag: 'HIGH ENSEMBLE SPREAD',
    desc: 'Bay of Bengal low pressure system track displacement causing sharp local precipitation discrepancy.',
  },
  {
    title: 'Stable Low-Error Forecast — Rajasthan',
    date: '2025-02-10',
    region: 'Rajasthan',
    leadDay: 3,
    tag: 'HIGH RELIABILITY CASE',
    desc: 'Arid winter regime with high deterministic predictability and low model member dispersion.',
  },
  {
    title: 'Orographic Precipitation Peak — Kerala',
    date: '2025-06-18',
    region: 'Kerala',
    leadDay: 4,
    tag: 'MONSOON GATEWAY',
    desc: 'Western Ghats onshore monsoon surge with intense localized orographic amplification.',
  },
];

export default function HistoricalReplay() {
  const [date, setDate] = useState('2025-08-15');
  const [region, setRegion] = useState('Gujarat');
  const [leadDay, setLeadDay] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showModelTrace, setShowModelTrace] = useState(false);

  const resultRef = useRef(null);

  const handleRunReplay = async (customDate = date, customRegion = region, customLead = leadDay) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await runHistoricalReplay(customDate, customRegion, customLead);
      setResult(res);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError('Failed to run historical replay. Please verify parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuickCase = (c) => {
    setDate(c.date);
    setRegion(c.region);
    setLeadDay(c.leadDay);
    handleRunReplay(c.date, c.region, c.leadDay);
  };

  return (
    <div className="replay-page">
      {/* Page Header */}
      <div className="card-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-5 h-5 text-[var(--accent-cyan)]" />
              <h2 className="page-title">
                Historical Forecast Replay Laboratory
              </h2>
            </div>
            <p className="body-text text-xs max-w-3xl">
              Replay a forecast cycle and compare ForecastGuard's predicted bust risk with the historical verification outcome.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[#FBBF24]">
              DEMONSTRATION DATA
            </span>
          </div>
        </div>
      </div>

      {/* Quick Select Preset Cases (2x2 Grid) */}
      <div>
        <h3 className="section-title text-xs text-[var(--text-muted)] mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
          Pre-Configured Demonstration Scenarios:
        </h3>
        <div className="replay-preset-grid">
          {QUICK_CASES.map((c, i) => (
            <button
              key={i}
              onClick={() => loadQuickCase(c)}
              className="card-panel text-left hover:border-[var(--border-focus)] transition-all flex flex-col justify-between gap-2.5 group cursor-pointer bg-[var(--surface-2)] p-4"
            >
              <div>
                <span className="text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-wider font-mono block mb-1">
                  {c.tag}
                </span>
                <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors leading-snug">
                  {c.title}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-2">
                  {c.desc}
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono pt-2 border-t border-[var(--border-subtle)]">
                <span>{c.region} · D{c.leadDay} · {c.date}</span>
                <span className="text-[var(--accent-cyan)] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Load &amp; Run &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Controls (Strict Dark Theme) */}
      <div className="card-panel">
        <div className="replay-controls-grid">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              Historical Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              Division / State
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Gujarat, Odisha, Kerala"
              className="form-input"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              Lead Day Horizon
            </label>
            <select
              value={leadDay}
              onChange={(e) => setLeadDay(parseInt(e.target.value, 10))}
              className="form-select cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                <option key={d} value={d}>
                  Day {d} (+{d * 24} hours)
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => handleRunReplay()}
              disabled={isLoading}
              className="btn-primary w-full h-[38px]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isLoading ? 'Executing Replay...' : 'RUN HISTORICAL REPLAY'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State Before Execution */}
      {!result && !isLoading && (
        <div className="card-panel py-12 px-6 text-center border-dashed border-[var(--border-strong)]">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--accent-cyan)] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="section-title text-[var(--text-primary)]">Select a Case to Begin</h3>
            <p className="body-text text-xs">
              Choose a pre-configured demonstration scenario above or specify a historical forecast cycle to evaluate ForecastGuard's prediction against ground truth verification.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3 text-xs font-mono text-[var(--text-muted)]">
              <span className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)]">NWP Forecast Run</span>
              <span>&rarr;</span>
              <span className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--accent-cyan)]">ForecastGuard AI Layer</span>
              <span>&rarr;</span>
              <span className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)]">Ground Verification</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Presentation */}
      {result && (
        <div ref={resultRef} className="space-y-4 animate-in fade-in duration-300">
          {/* Main Decision Banner */}
          <div className={`card-panel border-l-4 ${
            result.prediction_correct ? 'border-l-[#22C55E] bg-[var(--surface-2)]' : 'border-l-[#F59E0B] bg-[var(--surface-2)]'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {result.prediction_correct ? (
                  <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.15)] text-[#4ADE80] flex items-center justify-center border border-[rgba(34,197,94,0.3)] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[rgba(245,158,11,0.15)] text-[#FBBF24] flex items-center justify-center border border-[rgba(245,158,11,0.3)] shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {result.prediction_correct ? '✓ PREDICTION VALIDATED — CORRECTLY DETECTED' : '✗ MARGINAL CASE PREDICTION'}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--accent-cyan)] border border-[var(--border)]">
                      {result.region} • Day {result.lead_day} • {result.date}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    ForecastGuard predicted a{' '}
                    <strong className="text-[var(--accent-cyan)] font-mono">
                      {(result.predicted_bust_probability * 100).toFixed(0)}% Bust Probability ({result.confidence?.risk_level || 'ELEVATED RISK'})
                    </strong>
                    . Ground verification yielded an absolute error of{' '}
                    <strong className="text-[#FBBF24] font-mono">{result.absolute_error} mm</strong>{' '}
                    (Regional Bust Threshold: &gt;{result.bust_threshold} mm).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right shrink-0">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono block">Ground Outcome</span>
                  <div className={`text-xs font-bold font-mono ${result.actual_bust ? 'text-[#F87171]' : 'text-[#4ADE80]'}`}>
                    {result.actual_bust ? 'ACTUAL BUST (YES)' : 'NORMAL (NO BUST)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three-Column Structured Verification Grid */}
          <div className="replay-results-grid">
            {/* Column 1: ForecastGuard Prediction */}
            <div className="card-panel space-y-2.5">
              <span className="text-[11px] font-bold text-[var(--accent-cyan)] uppercase tracking-wider font-mono block border-b border-[var(--border-subtle)] pb-1.5">
                1. ForecastGuard Prediction
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-[var(--text-muted)]">Bust Probability:</span>
                  <span className="font-mono text-[var(--text-primary)] font-extrabold text-xl">
                    {(result.predicted_bust_probability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Assessed Risk:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {result.confidence?.risk_level || 'HIGH RISK'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Forecast Reliability:</span>
                  <span className="font-bold font-mono text-[#FBBF24]">
                    {result.confidence?.level || 'LOW'} ({result.confidence?.score || 45}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Actual Verification */}
            <div className="card-panel space-y-2.5">
              <span className="text-[11px] font-bold text-[#FBBF24] uppercase tracking-wider font-mono block border-b border-[var(--border-subtle)] pb-1.5">
                2. Actual Verification
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Forecast Rain:</span>
                  <span className="text-[var(--accent-cyan)] font-bold">{result.forecast_value} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Observed Rain:</span>
                  <span className="text-[#4ADE80] font-bold">{result.observed_value} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Absolute Error:</span>
                  <span className="text-[#FBBF24] font-extrabold">{result.absolute_error} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Bust Threshold:</span>
                  <span className="text-[var(--text-secondary)]">&gt; {result.bust_threshold} mm error</span>
                </div>
              </div>
            </div>

            {/* Column 3: Prediction Outcome */}
            <div className="card-panel space-y-2.5">
              <span className="text-[11px] font-bold text-[#4ADE80] uppercase tracking-wider font-mono block border-b border-[var(--border-subtle)] pb-1.5">
                3. Prediction Outcome
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Predicted:</span>
                  <span className="font-bold font-mono text-[var(--text-primary)]">
                    {result.predicted_bust_decision ? 'BUST WARNING' : 'NORMAL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Actual:</span>
                  <span className="font-bold font-mono text-[var(--text-primary)]">
                    {result.actual_bust ? 'BUST DETECTED' : 'NORMAL'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Classification:</span>
                  <span className="font-extrabold font-mono text-[#4ADE80]">
                    {result.prediction_correct ? '✓ TRUE POSITIVE' : '✗ DISCREPANCY'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Comparison Bars */}
          <div className="card-panel">
            <h4 className="card-title-text mb-3">
              Forecast vs Observed Ground Failure Breakdown:
            </h4>
            <div className="space-y-3 max-w-2xl">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">FORECAST RAINFALL</span>
                  <span className="font-mono text-[var(--accent-cyan)] font-bold">{result.forecast_value} mm</span>
                </div>
                <div className="w-full bg-[var(--surface-2)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--accent-cyan)] h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, (result.forecast_value / 120) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">OBSERVED RAINFALL</span>
                  <span className="font-mono text-[#4ADE80] font-bold">{result.observed_value} mm</span>
                </div>
                <div className="w-full bg-[var(--surface-2)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4ADE80] h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, (result.observed_value / 120) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-primary)] font-medium">ABSOLUTE VERIFICATION ERROR (|F - O|)</span>
                  <span className="font-mono text-[#FBBF24] font-bold">{result.absolute_error} mm (Threshold: {result.bust_threshold} mm)</span>
                </div>
                <div className="w-full bg-[var(--surface-2)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FBBF24] h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, (result.absolute_error / 120) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Why did ForecastGuard flag this case? */}
          <div className="card-panel">
            <h4 className="card-title-text mb-3">
              <HelpCircle className="w-4 h-4 text-[var(--accent-cyan)]" />
              Why did ForecastGuard flag this case?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(result.factors || []).slice(0, 3).map((f, idx) => (
                <div key={idx} className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[var(--text-primary)]">{f.title}</h5>
                    <span className="text-[9px] font-mono font-bold text-[var(--accent-cyan)] uppercase px-1.5 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--border)]">
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Model Trace */}
          <div className="card-panel">
            <button
              onClick={() => setShowModelTrace(!showModelTrace)}
              className="w-full flex items-center justify-between text-xs font-mono text-[var(--accent-cyan)] font-bold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Inspect Model Trace Pipeline (Inference Data Flow)
              </span>
              {showModelTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showModelTrace && (
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2.5 animate-in fade-in text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border)]">1. Historical Case Ingestion</span>
                  <ArrowRight className="w-3 h-3 text-[var(--accent-cyan)]" />
                  <span className="px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border)]">2. 20-Feature Engineering Vector</span>
                  <ArrowRight className="w-3 h-3 text-[var(--accent-cyan)]" />
                  <span className="px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border)]">3. XGBoost Logit Prediction</span>
                  <ArrowRight className="w-3 h-3 text-[var(--accent-cyan)]" />
                  <span className="px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--accent-cyan)] border border-[var(--border-strong)]">4. Isotonic Calibration ({(result.predicted_bust_probability * 100).toFixed(0)}%)</span>
                  <ArrowRight className="w-3 h-3 text-[var(--accent-cyan)]" />
                  <span className="px-2 py-1 rounded bg-[var(--surface-2)] text-[#4ADE80] border border-[rgba(34,197,94,0.4)]">5. Decision Evaluation ({result.prediction_correct ? 'MATCH' : 'DISCREPANCY'})</span>
                </div>
                <p className="text-[var(--text-muted)] text-[11px] font-sans">
                  The model extracted regional rolling 7-day error metrics, ensemble spread-to-mean dispersion, and cyclic seasonal markers to generate this prediction.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
