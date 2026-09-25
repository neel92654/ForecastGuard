import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Cpu, Info } from 'lucide-react';

export default function ExplanationPanel({ factors = [], bustProbability = 0, isLoading }) {
  const [showTechnicalDrawer, setShowTechnicalDrawer] = useState(false);

  if (isLoading) {
    return (
      <div className="card-panel animate-pulse h-full">
        <div className="h-4 bg-[var(--surface-2)] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-14 bg-[var(--surface-2)] rounded"></div>
          <div className="h-14 bg-[var(--surface-2)] rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate maximum absolute importance for proportional relative scaling
  const maxImportance = factors.reduce((max, f) => Math.max(max, Math.abs(f.importance || 0.1)), 0.1);

  return (
    <div className="card-panel flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="card-title-text m-0">
              Why is this forecast at risk?
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-[var(--accent-cyan)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
            MODEL EXPLAINABILITY
          </span>
        </div>

        {/* Operational Reasons List */}
        <div className="space-y-2.5">
          {factors.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] italic py-4 text-center">
              Standard deterministic atmospheric conditions. No anomalous bust triggers identified.
            </div>
          ) : (
            factors.slice(0, 3).map((factor, idx) => {
              const severity = factor.severity || 'low';
              const rawImp = factor.importance || 0;
              const relPct = Math.min(100, Math.max(20, (Math.abs(rawImp) / maxImportance) * 100));

              let badgeStyle = 'risk-badge-low';
              let influenceLabel = 'Mild influence';
              if (severity === 'high' || relPct > 70) {
                badgeStyle = 'risk-badge-very-high';
                influenceLabel = 'Strong influence';
              } else if (severity === 'moderate' || relPct > 40) {
                badgeStyle = 'risk-badge-moderate';
                influenceLabel = 'Moderate influence';
              }

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-[var(--surface-3)] text-[var(--accent-cyan)] flex items-center justify-center text-[10px] font-bold font-mono">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {factor.title}
                      </h4>
                    </div>
                    <span className={`risk-badge py-0.5 px-1.5 text-[9px] ${badgeStyle}`}>
                      {influenceLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] pl-6 leading-relaxed">
                    {factor.description}
                  </p>

                  {/* Relative Proportional Bar */}
                  <div className="pl-6 flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-muted)] font-mono">
                    <span className="text-[9px] text-[var(--text-muted)]">Relative impact:</span>
                    <div className="flex-1 bg-[var(--surface-3)] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-[var(--accent-cyan)] h-full rounded-full transition-all duration-300"
                        style={{ width: `${relPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Technical Attribution Drawer Toggle */}
        <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => setShowTechnicalDrawer(!showTechnicalDrawer)}
            className="w-full flex items-center justify-between p-2 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-[11px] font-mono text-[var(--accent-cyan)] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              Technical Model Attribution (SHAP)
            </span>
            {showTechnicalDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTechnicalDrawer && (
            <div className="mt-2 p-2 rounded bg-[var(--surface-3)] border border-[var(--border)] text-[11px] space-y-1.5 animate-in fade-in">
              <div className="text-[10px] text-[var(--text-muted)] font-mono italic mb-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-[var(--accent-cyan)] shrink-0" />
                Raw SHAP feature attributions — numerical contribution values:
              </div>
              <table className="data-table text-[10px]">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th className="num">SHAP Value</th>
                    <th>Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {factors.map((f, idx) => {
                    const val = f.importance || 0;
                    const sign = val >= 0 ? '+' : '';
                    return (
                      <tr key={idx}>
                        <td className="text-[var(--text-primary)] font-medium">{f.feature || f.title}</td>
                        <td className={`num font-bold ${val >= 0 ? 'text-[#FBBF24]' : 'text-[#4ADE80]'}`}>
                          {sign}{val.toFixed(3)}
                        </td>
                        <td className="text-[var(--text-muted)]">
                          {val >= 0 ? 'Increases risk' : 'Reduces risk'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono">
        <span>Reason System: MoES-NWP v1.0</span>
        <span className="text-[var(--accent-cyan)]">TreeSHAP Evaluator</span>
      </div>
    </div>
  );
}
