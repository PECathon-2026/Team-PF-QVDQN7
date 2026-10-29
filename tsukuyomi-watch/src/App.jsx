import React, { useState, useEffect } from 'react';
import AppHeader from './components/AppHeader.jsx';
import LocationSearch from './components/LocationSearch.jsx';
import Watchtower from './components/Watchtower.jsx';
import CelestialScroll from './components/CelestialScroll.jsx';
import SpiritLens from './components/SpiritLens.jsx';
import { getHonorData, recordObservation } from './utils/honorStorage.js';

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

  // Honor Points state
  const [honorPoints, setHonorPoints] = useState(0);
  const [observedEvents, setObservedEvents] = useState([]);

  useEffect(() => {
    const data = getHonorData();
    setHonorPoints(data.totalPoints);
    setObservedEvents(data.observedEventIds);
  }, []);

  const handleObserveEvent = (eventId, pointValue) => {
    const res = recordObservation(eventId, pointValue);
    if (res.success) {
      setHonorPoints(res.totalPoints);
      setObservedEvents(res.observedEventIds);
    }
  };

  return (
    <div className="app-container">
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        honorPoints={honorPoints}
      />

      {/* Global Location Bar & Search */}
      <div className="location-banner" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="location-indicator">
            <span>📍</span>
            <strong>{selectedLocation.name}, {selectedLocation.country}</strong>
          </div>
          <span className="location-coords">
            {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E ({selectedLocation.timezone})
          </span>
        </div>

        {/* Search Bar */}
        <LocationSearch onSelectLocation={setSelectedLocation} />
      </div>

      {/* Viewport for Active Tab */}
      <main>
        {activeTab === 'watchtower' && (
          <Watchtower location={selectedLocation} />
        )}

        {activeTab === 'scroll' && (
          <CelestialScroll
            location={selectedLocation}
            observedEventIds={observedEvents}
            onObserveEvent={handleObserveEvent}
          />
        )}

        {activeTab === 'spirit-lens' && (
          <SpiritLens />
        )}
      </main>
    </div>
  );
}