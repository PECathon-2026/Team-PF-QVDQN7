import React, { useState } from 'react';
import { searchLocations } from '../services/geocoding.js';

export default function LocationSearch({ onSelectLocation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setSearchError(null);
    try {
      const results = await searchLocations(searchTerm);
      if (results.length === 0) {
        setSearchError('No places found. Try another city or spelling.');
      }
      setSearchResults(results);
    } catch (err) {
      setSearchError('Failed to fetch locations. Please check internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePick = (loc) => {
    onSelectLocation(loc);
    setSearchResults([]);
    setSearchTerm('');
    setSearchError(null);
  };

  return (
    <div className="location-search-box">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search city (e.g. Kyoto, Delhi, Tokyo)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? 'Seeking...' : 'Search'}
        </button>
      </form>

      {searchError && <p className="search-msg error">{searchError}</p>}

      {searchResults.length > 0 && (
        <ul className="results-dropdown">
          {searchResults.map((loc, idx) => (
            <li
              key={`${loc.name}-${loc.latitude}-${idx}`}
              onClick={() => handlePick(loc)}
              className="result-item"
            >
              <strong>{loc.name}</strong>
              <span className="result-sub">
                {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country} ({loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}