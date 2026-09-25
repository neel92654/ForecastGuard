import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export default function ConfidenceCard({ confidence, isLoading }) {
  if (isLoading || !confidence) {
    return (
      <div className="card-panel animate-pulse flex flex-col justify-between" style={{ minHeight: '220px' }}>
        <div className="h-4 bg-[var(--surface-2)] rounded w-1/3"></div>
        <div className="h-10 bg-[var(--surface-2)] rounded w-1/2 my-2"></div>
        <div className="h-14 bg-[var(--surface-2)] rounded"></div>
      </div>
    );
  }

  const score = confidence.score || 70.0;
  const level = confidence.level || 'MEDIUM';

  let badgeClass = 'risk-badge-low';
  if (level === 'MEDIUM' || level === 'MODERATE') badgeClass = 'risk-badge-moderate';
  else if (level === 'LOW') badgeClass = 'risk-badge-high';
  else if (level === 'VERY LOW') badgeClass = 'risk-badge-very-high';

  return (
    <div className="card-panel flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-cyan)]" />
          <h3 className="card-title-text m-0">
            Forecast Reliability Index
          </h3>
        </div>
        <span className={`risk-badge ${badgeClass}`}>
          {level} RELIABILITY
        </span>
      </div>

      {/* Main Score with breathing room */}
      <div className="my-2">
        <div className="kpi-primary text-[48px] text-[var(--text-primary)]">
          {score}%
        </div>
        <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
          Composite Multi-Signal Reliability
        </div>

        <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden mt-2.5">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {/* Breakdown Contributions */}
      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5 text-xs">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {confidence.summary}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
          <div>
            <div className="flex justify-between text-[var(--text-muted)] mb-0.5">
              <span>Bust Risk</span>
              <span className="text-[var(--text-primary)] font-bold">50%</span>
            </div>
            <div className="w-full bg-[var(--surface-2)] h-1 rounded-full overflow-hidden">
              <div className="bg-[var(--accent-cyan)] h-full w-1/2"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[var(--text-muted)] mb-0.5">
              <span>Lead Horizon</span>
              <span className="text-[var(--text-primary)] font-bold">25%</span>
            </div>
            <div className="w-full bg-[var(--surface-2)] h-1 rounded-full overflow-hidden">
              <div className="bg-[#64748B] h-full w-1/4"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[var(--text-muted)] mb-0.5">
              <span>Ensemble Spread</span>
              <span className="text-[var(--text-primary)] font-bold">25%</span>
            </div>
            <div className="w-full bg-[var(--surface-2)] h-1 rounded-full overflow-hidden">
              <div className="bg-[#64748B] h-full w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
