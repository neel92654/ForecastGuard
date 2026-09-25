import React, { useState, useEffect } from 'react';
import ForecastContextBar from '../components/ForecastContextBar';
import RiskMap from '../components/RiskMap';
import RiskCard from '../components/RiskCard';
import ConfidenceCard from '../components/ConfidenceCard';
import ExplanationPanel from '../components/ExplanationPanel';
import ForecastComparison from '../components/ForecastComparison';
import ReliabilityChart from '../components/ReliabilityChart';
import { fetchRegions, fetchRisk, fetchRiskMap, fetchRegionalProfile } from '../services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('Gujarat');
  const [selectedVariable, setSelectedVariable] = useState('rainfall');
  const [selectedLead, setSelectedLead] = useState(5);

  const [riskData, setRiskData] = useState(null);
  const [riskMapData, setRiskMapData] = useState(null);
  const [regionalProfile, setRegionalProfile] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial regions list
  useEffect(() => {
    async function initRegions() {
      try {
        const regs = await fetchRegions();
        if (regs && regs.length > 0) {
          setRegions(regs);
        }
      } catch (err) {
        console.error('Error fetching regions:', err);
      }
    }
    initRegions();
  }, []);

  // Fetch prediction and profile data when region / variable / lead changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [riskRes, profileRes] = await Promise.all([
          fetchRisk(selectedRegion, selectedLead, selectedVariable),
          fetchRegionalProfile(selectedRegion, selectedVariable),
        ]);

        if (isMounted) {
          setRiskData(riskRes);
          setRegionalProfile(profileRes?.lead_profile || []);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to compute forecast bust risk. Backend service may be unreachable.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [selectedRegion, selectedLead, selectedVariable]);

  // Fetch risk map when lead day changes
  useEffect(() => {
    let isMounted = true;

    async function loadMap() {
      setIsMapLoading(true);
      try {
        const mapRes = await fetchRiskMap(selectedLead, selectedVariable);
        if (isMounted) {
          setRiskMapData(mapRes);
        }
      } catch (err) {
        console.error('Failed to load risk map:', err);
      } finally {
        if (isMounted) setIsMapLoading(false);
      }
    }

    loadMap();
    return () => { isMounted = false; };
  }, [selectedLead, selectedVariable]);

  return (
    <div className="dashboard-page">
      {/* 1. Forecast Context Bar: Region, Variable, 00Z Run, Segmented D1-D10 Horizon */}
      <ForecastContextBar
        regions={regions}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        selectedVariable={selectedVariable}
        onSelectVariable={setSelectedVariable}
        selectedLead={selectedLead}
        onSelectLead={setSelectedLead}
        leadSummary={regionalProfile}
      />

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setSelectedLead((l) => l)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-white font-medium cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* 2. Main Analysis Grid: Risk Map (64%) & Risk Summary (36%) */}
      <div className="dashboard-main-grid">
        {/* Left: National Risk Map */}
        <div className="flex flex-col">
          <RiskMap
            riskMapData={riskMapData}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            leadDay={selectedLead}
            isLoading={isMapLoading}
          />
        </div>

        {/* Right: Risk Summary -> Bust Risk & Reliability Index */}
        <div className="flex flex-col justify-between gap-4">
          <RiskCard riskData={riskData} isLoading={isLoading} />
          <ConfidenceCard confidence={riskData?.confidence} isLoading={isLoading} />
        </div>
      </div>

      {/* 3. Secondary Analysis Grid: 3-column balanced layout */}
      <div className="dashboard-lower-grid">
        <ExplanationPanel
          factors={riskData?.factors || []}
          bustProbability={riskData?.bust_probability || 0}
          isLoading={isLoading}
        />
        <ForecastComparison
          riskData={riskData}
          isLoading={isLoading}
        />
        <ReliabilityChart
          profileData={regionalProfile}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
