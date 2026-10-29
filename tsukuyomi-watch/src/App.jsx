import React, { useState } from 'react';

export default function App() {
  // Shared location data contract (Default: Chandigarh)
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Chandigarh',
    country: 'India',
    latitude: 30.7333,
    longitude: 76.7794,
    timezone: 'Asia/Kolkata',
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--accent-gold)', fontSize: '2rem', letterSpacing: '2px' }}>
          月読 TSUKUYOMI WATCH
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>The Samurai's Celestial Guide</p>
      </header>

      <main>
        <section style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Active Location</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {selectedLocation.name}, {selectedLocation.country} ({selectedLocation.latitude}° N, {selectedLocation.longitude}° E)
          </p>
        </section>
      </main>
    </div>
  );
}
