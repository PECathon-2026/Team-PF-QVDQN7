/**
 * Searches for a location by name using Open-Meteo Geocoding API.
 * Free, non-commercial, no API key required.
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=5&language=en&format=json`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Geocoding error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.results) {
    return [];
  }

  // Map to Tsukuyomi Watch shared location data contract
  return data.results.map((item) => ({
    name: item.name,
    country: item.country || '',
    admin1: item.admin1 || '',
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone || 'UTC',
  }));
}