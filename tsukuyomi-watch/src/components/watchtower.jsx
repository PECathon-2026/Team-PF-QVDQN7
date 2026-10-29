import React, { useState, useEffect } from 'react';
import { getStargazingWeather } from '../services/weather.js';
import { calculateNightHonorScore } from '../utils/score.js';

export default function Watchtower({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Cloud Cover</span>
          <span className="metric-value">{weather.cloudCover}%</span>
          <span className="metric-note">{weather.cloudCover < 20 ? 'Clear view' : weather.cloudCover < 60 ? 'Partly cloudy' : 'Heavy cover'}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Atmospheric Visibility</span>
          <span className="metric-value">{(weather.visibility / 1000).toFixed(1)} km</span>
          <span className="metric-note">Max clarity up to 20 km</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Relative Humidity</span>
          <span className="metric-value">{weather.humidity}%</span>
          <span className="metric-note">{weather.humidity > 80 ? 'High moisture/dew' : 'Dry conditions'}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Precipitation Risk</span>
          <span className="metric-value">{weather.precipitationProbability}%</span>
          <span className="metric-note">{weather.precipitationProbability > 30 ? 'Rain/precipitation likely' : 'Low rain chance'}</span>
        </div>
      </div>
    </div>
  );
}