import React from 'react';
import { CloudRain, Info } from 'lucide-react';

export default function ForecastComparison({ riskData, isLoading }) {
  if (isLoading || !riskData) {
    return (
      <div className="card-panel animate-pulse h-full">
        <div className="h-4 bg-[var(--surface-secondary)] rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-[var(--surface-secondary)] rounded"></div>
      </div>
    );
  }

  const fcstVal = riskData.forecast_value || 0;
  const bustThresh = riskData.bust_threshold || 25;
  const histMae = riskData.historical_mae || 4.5;
  const histRmse = riskData.historical_rmse || 6.2;

  // Max value for scaling visual bars
  const maxVal = Math.max(fcstVal, bustThresh, histRmse, 50) * 1.15;

  return (
    <div className="card-panel flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] mb-3.5">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="card-title-text m-0">
              Forecast vs Verification Tolerance
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
            {riskData.region} • D{riskData.lead_day}
          </span>
        </div>

        {/* Visual Comparison Bars with explicit labels */}
        <div className="space-y-3 my-2">
          {/* Current Forecast */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-primary)] font-medium">CURRENT FORECAST</span>
              <span className="font-mono text-[var(--accent-cyan)] font-bold">{fcstVal} mm</span>
            </div>
            <div className="w-full bg-[var(--surface-secondary)] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--accent-cyan)] h-full rounded-full transition-all duration-500"
                style={{ width: `${(fcstVal / maxVal) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Regional Bust Threshold for ERROR */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-primary)] font-medium">BUST THRESHOLD (ABSOLUTE ERROR)</span>
              <span className="font-mono text-[#fbbf24] font-bold">&gt; {bustThresh} mm error</span>
            </div>
            <div className="w-full bg-[var(--surface-secondary)] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#fbbf24] h-full rounded-full transition-all duration-500"
                style={{ width: `${(bustThresh / maxVal) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Historical Baseline MAE */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)] font-medium">HISTORICAL MAE (EXPECTED ERROR)</span>
              <span className="font-mono text-[var(--text-muted)] font-bold">{histMae} mm</span>
            </div>
            <div className="w-full bg-[var(--surface-secondary)] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#64748b] h-full rounded-full transition-all duration-500"
                style={{ width: `${(histMae / maxVal) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-1.5 rounded bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[9px] text-[var(--text-muted)] uppercase font-mono block">HISTORICAL RMSE</span>
            <div className="font-mono text-[var(--text-primary)] font-bold text-xs mt-0.5">{histRmse} mm</div>
          </div>
          <div className="p-1.5 rounded bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[9px] text-[var(--text-muted)] uppercase font-mono block">BUST CRITERIA</span>
            <div className="font-mono text-[#fbbf24] text-[11px] font-medium mt-0.5">|Error| &ge; {bustThresh} mm</div>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] leading-snug flex items-center gap-1.5 font-mono">
          <Info className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
          <span>Forecast bust is defined when |Forecast - Observed| &ge; 90th percentile threshold.</span>
        </p>
      </div>
    </div>
  );
}
