import React from 'react';
import { MapPin, CloudRain, Layers, CalendarCheck } from 'lucide-react';

export default function RegionSelector({
  regions = [],
  selectedRegion,
  onSelectRegion,
  selectedVariable,
  onSelectVariable,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
      {/* Region Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Target Meteorological Division
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => onSelectRegion(e.target.value)}
          className="bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          {regions.map((r) => (
            <option key={r.name} value={r.name} className="bg-slate-900 text-white">
              {r.name} ({r.zone} • {r.climate})
            </option>
          ))}
        </select>
      </div>

      {/* Meteorological Variable Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          Target Forecast Variable
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectVariable('rainfall')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              selectedVariable === 'rainfall'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            Rainfall (mm)
          </button>
          <span 
            className="text-[10px] text-slate-500 font-mono px-2 py-1 rounded bg-slate-800/40 border border-slate-700/40"
            title="Temperature, Wind, and Humidity are supported in the feature engine and extensible for future multi-variable models."
          >
            +4 Extensible
          </span>
        </div>
      </div>

      {/* Forecast Initialization Cycle */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-cyan-400" />
          NWP Operational Cycle
        </label>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/80 text-xs font-mono text-slate-300">
          <span>00:00 UTC Global Run</span>
          <span className="text-[10px] text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}
