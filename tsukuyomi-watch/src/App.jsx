import React, { useState } from 'react';
import AppHeader from './components/AppHeader.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('watchtower');

  // Shared location data contract (Default: Chandigarh)
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Chandigarh',
    country: 'India',
    latitude: 30.7333,
    longitude: 76.7794,
    timezone: 'Asia/Kolkata',
  });

  return (
    <div className="app-container">
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Location Bar */}
      <div className="location-banner">
        <div className="location-indicator">
          <span>📍</span>
          <strong>{selectedLocation.name}, {selectedLocation.country}</strong>
        </div>
        <span className="location-coords">
          {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E ({selectedLocation.timezone})
        </span>
      </div>

      {/* Viewport for Active Tab */}
      <main>
        {activeTab === 'watchtower' && (
          <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--accent-gold)' }}>Watchtower (Stargazing Spot Finder)</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Weather forecast, Night Honor Score, and candidate viewing spots will appear here.
            </p>
          </div>
        )}

        {activeTab === 'scroll' && (
          <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--accent-gold)' }}>Celestial Scroll (Space Events & Moon)</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Moon phases, moonrise times, meteor showers, and launch feeds will appear here.
            </p>
          </div>
        )}

        {activeTab === 'spirit-lens' && (
          <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--accent-gold)' }}>Spirit Lens & Dojo Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Browser-side image processing, noise reduction, and before/after comparison slider will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
