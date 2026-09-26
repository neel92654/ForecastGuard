/**
 * Resolve API base URL from Vite environment variable with robust normalization.
 * Handles:
 * - 'https://forecastguard-6xm3.onrender.com' -> 'https://forecastguard-6xm3.onrender.com/api'
 * - 'https://forecastguard-6xm3.onrender.com/api' -> 'https://forecastguard-6xm3.onrender.com/api'
 * - '' or undefined -> '/api' (proxied by Vite dev server / Nginx)
 */
function getApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/api`;
  }
  return cleanUrl;
}

const API_BASE = getApiBaseUrl();

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Health API error:', err);
    return null;
  }
}

export async function fetchRegions() {
  try {
    const res = await fetch(`${API_BASE}/regions`);
    if (!res.ok) throw new Error(`Failed to load regions: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Regions API error:', err);
    return [];
  }
}

export async function fetchRisk(region = 'Gujarat', leadDay = 5, variable = 'rainfall') {
  try {
    const res = await fetch(`${API_BASE}/risk?region=${encodeURIComponent(region)}&lead_day=${leadDay}&variable=${variable}`);
    if (!res.ok) throw new Error(`Risk API failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Risk API error:', err);
    throw err;
  }
}

export async function fetchRiskMap(leadDay = 5, variable = 'rainfall') {
  try {
    const res = await fetch(`${API_BASE}/risk-map?lead_day=${leadDay}&variable=${variable}`);
    if (!res.ok) throw new Error(`Risk Map API failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Risk Map API error:', err);
    throw err;
  }
}

export async function fetchRegionalProfile(region = 'Gujarat', variable = 'rainfall') {
  try {
    const res = await fetch(`${API_BASE}/forecast/profile?region=${encodeURIComponent(region)}&variable=${variable}`);
    if (!res.ok) throw new Error(`Profile API failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Profile API error:', err);
    throw err;
  }
}

export async function fetchVerification() {
  try {
    const res = await fetch(`${API_BASE}/verification`);
    if (!res.ok) throw new Error(`Verification API failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Verification API error:', err);
    throw err;
  }
}

export async function fetchModelMetrics() {
  try {
    const res = await fetch(`${API_BASE}/model/metrics`);
    if (!res.ok) throw new Error(`Metrics API failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Model Metrics API error:', err);
    throw err;
  }
}

export async function runHistoricalReplay(date, region, leadDay) {
  try {
    const res = await fetch(`${API_BASE}/historical-replay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        region,
        lead_day: parseInt(leadDay, 10),
      }),
    });
    if (!res.ok) throw new Error(`Historical Replay failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Historical Replay API error:', err);
    throw err;
  }
}
