import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export default function RiskCard({ riskData, isLoading }) {
  if (isLoading || !riskData) {
    return (
      <div className="card-panel animate-pulse flex flex-col justify-between" style={{ minHeight: '220px' }}>
        <div className="h-4 bg-[var(--surface-2)] rounded w-1/3"></div>
        <div className="h-12 bg-[var(--surface-2)] rounded w-2/3 my-2"></div>
        <div className="h-14 bg-[var(--surface-2)] rounded"></div>
      </div>
    );
  }

  const bustProb = riskData.bust_probability || 0;
  const bustPct = (bustProb * 100).toFixed(0);
  const conf = riskData.confidence || {};
  const riskCode = conf.risk_code || 'LOW';

  let badgeClass = 'risk-badge-low';
  if (riskCode === 'MEDIUM' || riskCode === 'MODERATE') badgeClass = 'risk-badge-moderate';
  else if (riskCode === 'HIGH') badgeClass = 'risk-badge-high';
  else if (riskCode === 'VERY_HIGH') badgeClass = 'risk-badge-very-high';

  return (
    <div className="card-panel flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--accent-cyan)]" />
          <h3 className="card-title-text m-0">
            Forecast Bust Risk
          </h3>
        </div>
        <span className={`risk-badge ${badgeClass}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: conf.risk_color || '#22C55E' }}></span>
          {conf.risk_level || 'LOW RISK'}
        </span>
      </div>

      {/* Main Metric with vertical breathing room */}
      <div className="my-2">
        <div className="kpi-primary text-[48px] text-[var(--text-primary)]">
          {bustPct}%
        </div>
        <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
          Calibrated probability of unusually large forecast error
        </div>
        
        {/* Visual Progress Bar */}
        <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden mt-2.5">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(100, Math.max(5, bustPct))}%`,
              backgroundColor: conf.risk_color || '#22C55E',
            }}
          ></div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[var(--text-muted)]">
          <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
          <span>Estimated probability that forecast error will exceed regional &amp; lead-time bust threshold.</span>
        </div>
      </div>

      {/* Meteorological Context Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
        <div className="p-1.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
          <span className="micro-label text-[9px] text-[var(--text-muted)] block">Forecast</span>
          <div className="font-mono text-[var(--accent-cyan)] font-bold text-xs mt-0.5">
            {riskData.forecast_value} mm
          </div>
        </div>
        <div className="p-1.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
          <span className="micro-label text-[9px] text-[var(--text-muted)] block">Bust Threshold</span>
          <div className="font-mono text-[#FBBF24] font-bold text-xs mt-0.5">
            &gt; {riskData.bust_threshold} mm err
          </div>
        </div>
        <div className="p-1.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
          <span className="micro-label text-[9px] text-[var(--text-muted)] block">Hist. MAE</span>
          <div className="font-mono text-[var(--text-primary)] font-bold text-xs mt-0.5">
            {riskData.historical_mae} mm
          </div>
        </div>
        <div className="p-1.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
          <span className="micro-label text-[9px] text-[var(--text-muted)] block">Lead Horizon</span>
          <div className="font-mono text-[var(--accent-cyan)] font-bold text-xs mt-0.5">
            Day {riskData.lead_day}
          </div>
        </div>
      </div>
    </div>
  );
}
