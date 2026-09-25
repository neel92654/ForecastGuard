import React from 'react';
import { MapPin, CloudRain, Clock, CalendarCheck, SlidersHorizontal } from 'lucide-react';

export default function ForecastContextBar({
  regions = [],
  selectedRegion,
  onSelectRegion,
  selectedVariable,
  onSelectVariable,
  selectedLead,
  onSelectLead,
  leadSummary = [],
}) {
  const leadDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="card-panel-compact mb-4">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase font-mono">
        <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
          FORECAST CONTEXT
        </span>
        <span>Operational Cycle 00:00 UTC</span>
      </div>

      <div className="forecast-context-grid">
        {/* Region Selector */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[var(--accent-cyan)] shrink-0" />
            Meteorological Division
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="form-select cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} ({r.zone})
              </option>
            ))}
          </select>
        </div>

        {/* Variable Selector */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 truncate">
            <CloudRain className="w-3 h-3 text-[var(--accent-cyan)] shrink-0" />
            Variable
          </label>
          <select
            value={selectedVariable}
            onChange={(e) => onSelectVariable(e.target.value)}
            className="form-select cursor-pointer"
          >
            <option value="rainfall">Rainfall (mm)</option>
            <option value="temperature" disabled>Temperature (Extensible)</option>
            <option value="wind" disabled>Wind Speed (Extensible)</option>
          </select>
        </div>

        {/* Forecast Run Badge */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 truncate">
            <CalendarCheck className="w-3 h-3 text-[var(--accent-cyan)] shrink-0" />
            Forecast Run
          </label>
          <div className="h-[38px] px-3 rounded flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border-strong)] text-xs font-mono text-[var(--text-secondary)] min-w-0">
            <span className="truncate">00Z Operational</span>
            <span className="text-[10px] text-[var(--accent-cyan)] font-bold shrink-0 ml-1">LATEST</span>
          </div>
        </div>

        {/* Lead Day Segmented Bar */}
        <div className="flex flex-col gap-1 min-w-0 w-full">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider min-w-0">
            <span className="flex items-center gap-1 truncate">
              <Clock className="w-3 h-3 text-[var(--accent-cyan)] shrink-0" />
              Lead Day Horizon
            </span>
            <span className="font-mono text-[var(--accent-cyan)] font-bold shrink-0 text-right truncate ml-2">
              Day {selectedLead} (+{selectedLead * 24}h)
            </span>
          </div>
          <div className="lead-day-selector">
            {leadDays.map((day) => {
              const isActive = selectedLead === day;
              const dayInfo = leadSummary.find((d) => d.lead_day === day);
              const riskCode = dayInfo?.risk_code;

              let dotColor = '#64748b';
              if (riskCode === 'LOW') dotColor = '#22C55E';
              else if (riskCode === 'MEDIUM' || riskCode === 'MODERATE') dotColor = '#F59E0B';
              else if (riskCode === 'HIGH') dotColor = '#F97316';
              else if (riskCode === 'VERY_HIGH') dotColor = '#EF4444';

              return (
                <button
                  key={day}
                  onClick={() => onSelectLead(day)}
                  className={`segmented-pill lead-day-button ${isActive ? 'active' : ''}`}
                  title={`Select Lead Day ${day}`}
                >
                  <span className="text-[11px] font-mono leading-none">D{day}</span>
                  <span
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ backgroundColor: isActive ? '#060B16' : dotColor }}
                  ></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
