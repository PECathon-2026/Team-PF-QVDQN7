import React, { useState, useEffect } from 'react';
import { getStargazingWeather } from '../services/weather.js';
import { calculateNightHonorScore } from '../utils/score.js';
import { getLocalZenithCoordinates } from '../utils/zenith.js';
import MapPanel from './MapPanel.jsx';

export default function Watchtower({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Zenith Modal State
  const [isZenithOpen, setIsZenithOpen] = useState(false);
  const [zenithData, setZenithData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getStargazingWeather(location.latitude, location.longitude)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to retrieve forecast.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location.latitude, location.longitude]);

  const handleOpenZenith = () => {
    const coords = getLocalZenithCoordinates(location.latitude, location.longitude);
    setZenithData(coords);
    setIsZenithOpen(true);
  };

  if (loading) {
    return (
      <div className="watchtower-card">
        <p style={{ color: 'var(--text-muted)' }}>Reading the night sky forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watchtower-card">
        <p style={{ color: '#ff6b6b' }}>Forecast unavailable: {error}</p>
      </div>
    );
  }

  const scoreData = calculateNightHonorScore({
    cloudCover: weather.cloudCover,
    visibilityMeters: weather.visibility,
    humidity: weather.humidity,
  });

  const formattedTime = new Date(weather.time).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="watchtower-container">
      {/* Night Honor Score Card */}
      <div className="score-card">
        <div className="score-header">
          <h3>NIGHT HONOR SCORE</h3>
          <span className="forecast-time">Forecast for: {formattedTime}</span>
        </div>

        {scoreData ? (
          <div className="score-display">
            <div className="score-badge" style={{ borderColor: scoreData.color, color: scoreData.color }}>
              <span className="score-number">{scoreData.score}</span>
              <span className="score-max">/100</span>
            </div>
            <div className="score-details">
              <h4 style={{ color: scoreData.color }}>{scoreData.label}</h4>
              <p className="score-disclaimer">
                Heuristic rating based on cloud cover, visibility, and humidity. It is a comparative indicator, not a certainty of seeing stars.
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Score unavailable due to missing parameters.</p>
        )}

        {/* Zenith Action Trigger */}
        <div className="zenith-trigger-strip">
          <button className="zenith-btn" onClick={handleOpenZenith}>
            ⛩️ Peer Through Zenith (NASA SkyView)
          </button>
          <span className="zenith-hint">
            Calculates the celestial point directly above {location.name} right now
          </span>
        </div>
      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Cloud Cover</span>
          <span className="metric-value">{weather.cloudCover}%</span>
          <span className="metric-note">
            {weather.cloudCover < 20 ? 'Clear view' : weather.cloudCover < 60 ? 'Partly cloudy' : 'Heavy cover'}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Atmospheric Visibility</span>
          <span className="metric-value">{(weather.visibility / 1000).toFixed(1)} km</span>
          <span className="metric-note">Max clarity up to 20 km</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Relative Humidity</span>
          <span className="metric-value">{weather.humidity}%</span>
          <span className="metric-note">
            {weather.humidity > 80 ? 'High moisture/dew' : 'Dry conditions'}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Precipitation Risk</span>
          <span className="metric-value">{weather.precipitationProbability}%</span>
          <span className="metric-note">
            {weather.precipitationProbability > 30 ? 'Rain/precipitation likely' : 'Low rain chance'}
          </span>
        </div>
      </div>

      {/* Interactive Celestial Map */}
      <MapPanel location={location} />

      {/* NASA SkyView Zenith Portal Modal */}
      {isZenithOpen && zenithData && (
        <div className="zenith-modal-backdrop" onClick={() => setIsZenithOpen(false)}>
          <div className="zenith-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="zenith-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>⛩️</span>
                <h4 style={{ margin: 0, color: 'var(--accent-gold)' }}>
                  CELESTIAL ZENITH: {location.name.toUpperCase()}
                </h4>
              </div>
              <button className="zenith-close-btn" onClick={() => setIsZenithOpen(false)}>
                ✕
              </button>
            </div>

            <p className="zenith-modal-desc">
              By converting your geographic coordinates and local sidereal time, here is the exact deep-space equatorial field passing directly overhead right now.
            </p>

            <div className="zenith-coords-box">
              <div className="zenith-coord-item">
                <span className="coord-label">Right Ascension (RA / LST)</span>
                <span className="coord-value">{zenithData.raFormatted}</span>
                <span className="coord-sub">{zenithData.raDegrees.toFixed(4)}°</span>
              </div>
              <div className="zenith-coord-item">
                <span className="coord-label">Declination (Dec / Latitude)</span>
                <span className="coord-value">{zenithData.decFormatted}</span>
                <span className="coord-sub">{zenithData.decDegrees.toFixed(4)}°</span>
              </div>
            </div>

            <div className="zenith-survey-info">
              <div><strong>Survey:</strong> NASA Digitized Sky Survey (DSS Optical)</div>
              <div><strong>Field of View:</strong> 1.5° (Direct Zenith Sector)</div>
            </div>

            <div className="zenith-modal-actions">
              <a
                href={zenithData.skyViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="zenith-query-link"
              >
                🔭 Open SkyView Survey in NASA Portal
              </a>
              <button className="zenith-dismiss-btn" onClick={() => setIsZenithOpen(false)}>
                Return to Watchtower
              </button>
            </div>

            <p className="zenith-disclaimer">
              * Archival deep-sky survey data. This is an astronomical sky map, not a live atmospheric telescope or real-time cloud view.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

