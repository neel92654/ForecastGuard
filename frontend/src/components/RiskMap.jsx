import React from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet';
import { Layers, Info } from 'lucide-react';
import { INDIA_REGIONS_GEOJSON } from '../data/india_regions_geojson';

export default function RiskMap({
  riskMapData,
  selectedRegion,
  onSelectRegion,
  leadDay,
  isLoading,
}) {
  const indiaCenter = [22.8, 79.5];
  const zoomLevel = 4.6;

  const features = riskMapData?.features || [];

  // Lookup dictionary from region name to risk properties
  const riskLookup = {};
  features.forEach((f) => {
    const rName = (f.properties?.region || '').toLowerCase();
    riskLookup[rName] = f.properties;
  });

  const getFeatureStyle = (feature) => {
    const regName = (feature.properties?.name || '').toLowerCase();
    const isSelected = regName === (selectedRegion || '').toLowerCase();
    const riskProps = riskLookup[regName] || {};
    const riskColor = riskProps.risk_color || '#38bdf8';

    return {
      fillColor: riskColor,
      weight: isSelected ? 3 : 1.2,
      opacity: 1,
      color: isSelected ? '#18c7e8' : 'rgba(130, 160, 200, 0.25)',
      dashArray: isSelected ? '4, 4' : '',
      fillOpacity: isSelected ? 0.65 : 0.40,
    };
  };

  const onEachPolygon = (feature, layer) => {
    const regName = feature.properties?.name;
    const riskProps = riskLookup[(regName || '').toLowerCase()] || {};
    const bustProb = riskProps.bust_probability || 0;
    const riskLevel = riskProps.risk_level || 'LOW RISK';
    const fcstRain = riskProps.forecast_rainfall || 0;

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.85,
          weight: 2.5,
          color: '#18c7e8',
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(getFeatureStyle(feature));
      },
      click: () => {
        if (regName) {
          onSelectRegion(regName);
        }
      },
    });

    layer.bindTooltip(
      `<div style="font-family: Inter, sans-serif; font-size: 11px; padding: 2px;">
        <strong style="color: #ffffff;">${regName}</strong><br/>
        <span style="color: #18c7e8; font-family: monospace; font-weight: bold;">Bust Risk: ${(bustProb * 100).toFixed(0)}% (${riskLevel})</span><br/>
        <span style="color: #9fb0c7;">Forecast Rain: ${fcstRain} mm</span>
      </div>`,
      { direction: 'top', sticky: true, opacity: 0.95 }
    );
  };

  return (
    <div className="card-panel flex flex-col p-0 overflow-hidden" style={{ height: '450px' }}>
      {/* Map Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent-cyan)]" />
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-white">
            Forecast Bust Risk Map
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-secondary)]">
          <span>15 DIVISIONS</span>
          <span>&bull;</span>
          <span className="text-[var(--accent-cyan)] font-bold">DAY {leadDay}</span>
          <span>&bull;</span>
          <span>RAINFALL</span>
          {isLoading && (
            <span className="text-[var(--accent-cyan)] animate-pulse font-bold ml-1">
              [UPDATING]
            </span>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 w-full relative">
        <MapContainer
          key={`map-canvas-${leadDay}`}
          center={indiaCenter}
          zoom={zoomLevel}
          minZoom={4}
          maxZoom={8}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#060b18' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />

          <GeoJSON
            key={`geojson-layer-${leadDay}-${selectedRegion}`}
            data={INDIA_REGIONS_GEOJSON}
            style={getFeatureStyle}
            onEachFeature={onEachPolygon}
          />

          {features.map((feat) => {
            const props = feat.properties;
            const coords = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]];
            const isSelected = props.region.toLowerCase() === (selectedRegion || '').toLowerCase();
            const bustProb = props.bust_probability || 0;
            const riskColor = props.risk_color || '#38bdf8';
            const radius = isSelected ? 10 : 7;

            return (
              <CircleMarker
                key={props.region}
                center={coords}
                radius={radius}
                pathOptions={{
                  color: isSelected ? '#18c7e8' : '#ffffff',
                  fillColor: riskColor,
                  fillOpacity: 0.95,
                  weight: isSelected ? 2.5 : 1,
                }}
                eventHandlers={{
                  click: () => {
                    onSelectRegion(props.region);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={0.95}>
                  <div className="text-xs font-mono">
                    <strong>{props.region}</strong>: {(bustProb * 100).toFixed(0)}% Bust Risk
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Dynamic Legend */}
        <div className="absolute bottom-3 left-3 z-[400] bg-[var(--surface-base)] border border-[var(--border-subtle)] px-3 py-2 rounded-md shadow-lg text-[11px] max-w-[220px]">
          <div className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1 font-mono">
            <Info className="w-3 h-3 text-[var(--accent-cyan)]" />
            Bust Risk Legend
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span className="text-[var(--text-secondary)]">LOW (&lt;25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              <span className="text-[var(--text-secondary)]">MOD (25-50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
              <span className="text-[var(--text-secondary)]">HIGH (50-75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
              <span className="text-[var(--text-secondary)]">V.HIGH (&gt;75%)</span>
            </div>
          </div>
          <div className="pt-1.5 mt-1 border-t border-[var(--border-subtle)] text-[9px] text-[var(--text-muted)]">
            * Demonstration regional boundaries.
          </div>
        </div>

        {/* Subtle Basemap Status Badge */}
        <div className="absolute top-3 right-3 z-[400] bg-[var(--surface-base)] border border-[var(--border-subtle)] px-2.5 py-1 rounded text-[10px] text-[var(--text-muted)] font-mono">
          Basemap: Online &bull; Overlay active
        </div>
      </div>
    </div>
  );
}
