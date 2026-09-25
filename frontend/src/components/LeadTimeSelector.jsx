import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function LeadTimeSelector({ selectedLead, onSelectLead, leadSummary = [] }) {
  const leadDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Forecast Horizon (Lead Time):
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {leadDays.map((day) => {
          const isActive = selectedLead === day;
          // Find matching day profile if provided
          const dayInfo = leadSummary.find((d) => d.lead_day === day);
          const riskCode = dayInfo?.risk_code;

          let riskIndicatorClass = 'bg-slate-700';
          if (riskCode === 'LOW') riskIndicatorClass = 'bg-emerald-500';
          else if (riskCode === 'MEDIUM') riskIndicatorClass = 'bg-amber-500';
          else if (riskCode === 'HIGH') riskIndicatorClass = 'bg-orange-500';
          else if (riskCode === 'VERY_HIGH') riskIndicatorClass = 'bg-rose-500';

          return (
            <button
              key={day}
              onClick={() => onSelectLead(day)}
              className={`lead-pill relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 min-w-[44px] ${
                isActive
                  ? 'active text-white border-cyan-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
              title={`Lead Day ${day} Forecast Horizon (+${day * 24} hrs)`}
            >
              <span className="font-mono">D{day}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${riskIndicatorClass}`}></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
