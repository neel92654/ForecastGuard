import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import HistoricalReplay from './pages/HistoricalReplay';
import Verification from './pages/Verification';
import { fetchHealth } from './services/api';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    async function checkStatus() {
      const health = await fetchHealth();
      setSystemHealth(health);
    }
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={systemHealth}
      />

      {/* Main Page Content */}
      <main className="flex-1 app-shell pt-5">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'replay' && <HistoricalReplay />}
        {activeTab === 'verification' && <Verification />}
      </main>

      {/* Scientific Compliance & Product Positioning Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-base)] py-4 mt-10 text-[var(--text-muted)] text-xs">
        <div className="app-shell flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-cyan)]" />
            <span className="font-bold text-[var(--text-primary)]">ForecastGuard Prototype</span>
            <span>&bull;</span>
            <span>Smart India Hackathon (SIH26079) &bull; MoES / NCMRWF</span>
          </div>

          <div className="text-center md:text-right max-w-xl text-[11px] text-[var(--text-muted)] leading-normal">
            <strong>Prototype AI Layer:</strong> ForecastGuard does not replace Numerical Weather Prediction (NWP) systems.
            It provides an AI reliability layer that learns from historical forecast errors to predict forecast bust risk.
          </div>
        </div>
      </footer>
    </div>
  );
}
