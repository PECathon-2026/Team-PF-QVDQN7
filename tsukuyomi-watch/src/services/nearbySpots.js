/**
 * Queries OpenStreetMap via Overpass API for candidate outdoor spots
 * (parks, nature reserves, peaks, viewpoints) within ~20km.
 * If Overpass is slow or fails, falls back to labeled demo spots.
 */
export async function getCandidateSpots(latitude, longitude) {
  // Query for parks, viewpoints, nature reserves, and peaks
  const query = `
    [out:json][timeout:10];
    (
      node["leisure"="park"](around:20000,${latitude},${longitude});
      node["leisure"="nature_reserve"](around:20000,${latitude},${longitude});
      node["tourism"="viewpoint"](around:20000,${latitude},${longitude});
      node["natural"="peak"](around:20000,${latitude},${longitude});
    );
    out 10;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Overpass service returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      return getFallbackSpots(latitude, longitude);
    }

    return data.elements
      .filter((el) => el.tags && (el.tags.name || el.tags.tourism || el.tags.natural))
      .slice(0, 8)
      .map((el) => {
        let spotType = 'Candidate Park';
        let iconType = '🌲';

        if (el.tags.tourism === 'viewpoint') {
          spotType = 'Viewpoint';
          iconType = '⛩️';
        } else if (el.tags.natural === 'peak') {
          spotType = 'Mountain Peak';
          iconType = '⛰️';
        } else if (el.tags.leisure === 'nature_reserve') {
          spotType = 'Nature Reserve';
          iconType = '🎋';
        }

        return {
          id: el.id,
          name: el.tags.name || `Unnamed ${spotType}`,
          type: spotType,
          icon: iconType,
          lat: el.lat,
          lon: el.lon,
          isLiveOSM: true,
        };
      });
  } catch (err) {
    console.warn('Overpass API unavailable or rate-limited; displaying candidate fallback points.', err);
    return getFallbackSpots(latitude, longitude);
  }
}

function getFallbackSpots(latitude, longitude) {
  return [
    {
      id: 'fallback-1',
      name: 'High Ground Viewpoint (Estimated Candidate)',
      type: 'Viewpoint',
      icon: '⛩️',
      lat: latitude + 0.035,
      lon: longitude + 0.025,
      isLiveOSM: false,
    },
    {
      id: 'fallback-2',
      name: 'Forest Perimeter Reserve (Estimated Candidate)',
      type: 'Nature Reserve',
      icon: '🎋',
      lat: latitude - 0.04,
      lon: longitude - 0.03,
      isLiveOSM: false,
    },
    {
      id: 'fallback-3',
      name: 'Open Lakefront Boundary (Estimated Candidate)',
      type: 'Candidate Park',
      icon: '🌲',
      lat: latitude + 0.02,
      lon: longitude - 0.045,
      isLiveOSM: false,
    },
  ];
}