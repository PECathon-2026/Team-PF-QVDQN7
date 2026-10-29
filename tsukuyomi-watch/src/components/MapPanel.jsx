import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCandidateSpots } from '../services/nearbySpots.js';

// Fix default marker icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 11);
  }, [center, map]);
  return null;
}

function createCustomIcon(emoji) {
  return L.divIcon({
    html: `<div style="font-size: 22px; line-height: 1; text-align: center;">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function MapPanel({ location }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getCandidateSpots(location.latitude, location.longitude).then((data) => {
      if (active) {
        setSpots(data);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [location.latitude, location.longitude]);

  const mapCenter = [location.latitude, location.longitude];

  return (
    <div className="map-panel-container" style={{ marginTop: '1.5rem' }}>
      <div className="map-header">
        <h4>CANDIDATE CELESTIAL VANTAGE POINTS</h4>
        <span className="map-status">
          {loading ? 'Scanning terrain...' : `${spots.length} outdoor candidates located`}
        </span>
      </div>

      <div style={{ height: '380px', width: '100%', position: 'relative', marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          key={`${location.latitude}-${location.longitude}`}
          center={mapCenter}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <MapRecenter center={mapCenter} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={mapCenter} icon={createCustomIcon('📍')}>
            <Popup>
              <strong>{location.name}</strong><br />
              Observation Center
            </Popup>
          </Marker>

          {spots.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={createCustomIcon(spot.icon)}
            >
              <Popup>
                <strong>{spot.name}</strong><br />
                <em>Type: {spot.type}</em><br />
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  {spot.isLiveOSM ? 'Verified OpenStreetMap node' : 'Regional fallback spot'}<br />
                  Candidate outdoor spot, not certified dark-sky site.
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="map-disclaimer" style={{ marginTop: '0.75rem' }}>
        ⚠️ Markers indicate parks, nature reserves, and elevated terrain. They are not certified dark-sky spots. Local light pollution, park hours, and terrain rules apply.
      </p>
    </div>
  );
}