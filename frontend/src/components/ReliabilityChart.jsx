import React from 'react';
import { TrendingUp, Info } from 'lucide-react';

export default function ReliabilityChart({ profileData = [], selectedLead, onSelectLead, isLoading }) {
  if (isLoading || profileData.length === 0) {
    return (
      <div className="card-panel animate-pulse h-full">
        <div className="h-4 bg-[var(--surface-secondary)] rounded w-1/3 mb-4"></div>
        <div className="h-28 bg-[var(--surface-secondary)] rounded"></div>
      </div>
    );
  }

  return (
    <div className="card-panel flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] mb-3.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="card-title-text m-0">
              10-Day Forecast Bust Risk Profile
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--accent-cyan)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
            D1 TO D10 HORIZON
          </span>
        </div>

        {/* 10-Day Bar Profile Chart */}
        <div className="grid grid-cols-10 gap-1.5 items-end h-28 pt-2">
          {profileData.map((item) => {
            const isSelected = item.lead_day === selectedLead;
            const bustProb = item.bust_probability || 0;
            const heightPct = Math.max(15, Math.min(100, bustProb * 100));
            const riskColor = item.risk_color || '#18c7e8';

            return (
              <div
                key={item.lead_day}
                onClick={() => onSelectLead(item.lead_day)}
                className={`flex flex-col items-center gap-1 cursor-pointer group transition-all ${
                  isSelected ? 'scale-105' : 'opacity-75 hover:opacity-100'
                }`}
                title={`Day ${item.lead_day}: ${(bustProb * 100).toFixed(0)}% Bust Risk (${item.risk_code})`}
              >
                {/* Probability metric */}
                <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>
                  {(bustProb * 100).toFixed(0)}%
                </span>

                {/* Vertical Bar */}
                <div className="w-full bg-[var(--surface-secondary)] rounded-t h-16 flex items-end p-0.5 overflow-hidden">
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: riskColor,
                      boxShadow: isSelected ? `0 0 8px ${riskColor}aa` : 'none',
                    }}
                  ></div>
                </div>

                {/* Day label */}
                <span
                  className={`text-[10px] font-mono font-bold px-1 rounded ${
                    isSelected ? 'bg-[var(--accent-cyan)] text-[#060b18] font-extrabold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  D{item.lead_day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
          Y-Axis: Calibrated Bust Probability (0–100%)
        </span>
        <span className="text-[var(--accent-cyan)]">Click bar to select lead day</span>
      </div>
    </div>
  );
}
