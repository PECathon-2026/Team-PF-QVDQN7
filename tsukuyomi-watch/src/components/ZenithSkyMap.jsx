import React, { useMemo } from 'react';
import { getLocalZenithCoordinates } from '../utils/zenith.js';

export default function ZenithSkyMap({ location }) {
  // Provide robust fallbacks if location is loading or has missing fields
  const lat = location && typeof location.latitude === 'number' ? location.latitude : 30.7333;
  const lon = location && typeof location.longitude === 'number' ? location.longitude : 76.7794;
  const locName = location?.name || 'Chandigarh';

  // Calculate the live zenith coordinates
  const zenith = useMemo(() => {
    return getLocalZenithCoordinates(lat, lon);
  }, [lat, lon]);

  // Construct official, sandboxed deep-sky viewer URL centered on the Zenith RA/Dec
  const iframeUrl = `https://aladin.cds.unistra.fr/AladinLite/?target=${zenith.raDegrees.toFixed(4)}%20${zenith.decDegrees.toFixed(4)}&fov=3.0&survey=P%2FDSS2%2Fcolor`;

  const directSkyViewUrl = `https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl?Position=${zenith.raDegrees.toFixed(4)},${zenith.decDegrees.toFixed(4)}&Survey=DSS&Pixels=400&Size=1.5`;

  return (
    <div className="sky-panel-container">
      <div className="sky-header">
        <div>
          <h4>⛩️ ZENITH CELESTIAL CANOPY (DEEP-SKY SURVEY)</h4>
          <span className="sky-status">
            Targeting straight overhead: <strong>{locName}</strong> ({zenith.raFormatted} RA, {zenith.decFormatted} Dec)
          </span>
        </div>

        <a
          href={directSkyViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="survey-direct-link"
        >
          NASA SkyView Direct ↗
        </a>
      </div>

      {/* Embedded Deep-Sky Interactive Map */}
      <div className="aladin-viewport-frame" style={{ height: '390px', position: 'relative' }}>
        <iframe
          key={`${zenith.raDegrees.toFixed(2)}-${zenith.decDegrees.toFixed(2)}`}
          title="Zenith Sky Map"
          src={iframeUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#000000',
          }}
          loading="lazy"
          allow="fullscreen"
        />

        <div className="zenith-crosshair-hud">
          <span>+ LOCAL ZENITH</span>
        </div>
      </div>

      <p className="map-disclaimer" style={{ marginTop: '0.75rem' }}>
        ⚠️ Interactive sky survey (NASA / DSS2 Optical). Drag to pan, scroll to zoom. Shows the deep-sky field passing directly through the local zenith at this time[cite: 3].
      </p>
    </div>
  );
}