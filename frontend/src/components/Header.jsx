import React from 'react';
import { ShieldCheck, Activity, RotateCcw, BarChart3, Database } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, systemHealth }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface-1)] sticky top-0 z-50">
      <div className="app-shell app-header">
        {/* Left: Branding & Organization */}
        <div className="header-brand flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan-dim)] border border-[var(--accent-cyan)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold font-mono tracking-tight text-[var(--text-primary)]">
                FORECASTGUARD
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--accent-cyan)] border border-[var(--border)]">
                MoES / NCMRWF
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium leading-none mt-0.5">
              AI-Based Forecast Bust Detection
            </p>
          </div>
        </div>

        {/* Center: Main Application Tabs (Three Independent Buttons) */}
        <nav className="app-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Activity className="w-3.5 h-3.5" />
            Operations
          </button>
          <button
            onClick={() => setActiveTab('replay')}
            className={`nav-tab-item ${activeTab === 'replay' ? 'active' : ''}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Historical Replay
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`nav-tab-item ${activeTab === 'verification' ? 'active' : ''}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Verification
          </button>
        </nav>

        {/* Right: Operational Status Indicator & Demo Badge */}
        <div className="header-status">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] text-[#4ADE80] font-mono text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            <span>SYSTEM ONLINE</span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[#FBBF24] font-mono text-[11px] font-semibold cursor-help"
            title="Demonstration Mode: Uses synthetic meteorological historical dataset for prototype demonstration."
          >
            <Database className="w-3 h-3 text-[#F59E0B]" />
            <span>DEMO DATA</span>
          </div>
        </div>
      </div>
    </header>
  );
}
