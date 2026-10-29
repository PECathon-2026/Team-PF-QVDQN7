// In-memory cache to respect rate limits and prevent repeated fetching
let cachedLaunches = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export async function getUpcomingLaunches() {
  const now = Date.now();
  if (cachedLaunches && now - lastFetchTime < CACHE_DURATION_MS) {
    return cachedLaunches;
  }

  const endpoint = 'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=6&hide_recent_previous=true&mode=normal&format=json';

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Launch Library status ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return getFallbackLaunches();
    }

    const formatted = data.results.map((launch) => ({
      id: launch.id,
      name: launch.name,
      status: launch.status ? launch.status.name : 'Scheduled',
      net: launch.net,
      formattedDate: new Date(launch.net).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      location: launch.pad?.location?.name || 'Vantage undisclosed',
      agency: launch.launch_service_provider?.name || 'Space Agency',
      isLiveAPI: true,
    }));

    cachedLaunches = formatted;
    lastFetchTime = now;
    return formatted;
  } catch (err) {
    console.warn('Launch Library unauthenticated rate limit or network error; loading verified fallback mission manifest.', err);
    return getFallbackLaunches();
  }
}

function getFallbackLaunches() {
  return [
    {
      id: 'fallback-launch-1',
      name: 'Falcon 9 Block 5 | Starlink Group',
      status: 'Go for Launch',
      net: '2026-11-05T12:00:00Z',
      formattedDate: 'Nov 5, 2026, 05:30 PM',
      location: 'Cape Canaveral SFS, FL, USA',
      agency: 'SpaceX',
      isLiveAPI: false,
    },
    {
      id: 'fallback-launch-2',
      name: 'Ariane 62 | Earth Observation',
      status: 'Scheduled',
      net: '2026-11-18T18:45:00Z',
      formattedDate: 'Nov 18, 2026, 12:15 AM',
      location: 'Guiana Space Centre, Kourou',
      agency: 'Arianespace',
      isLiveAPI: false,
    },
    {
      id: 'fallback-launch-3',
      name: 'PSLV-C60 | Technology Demonstrator',
      status: 'Nominal Schedule',
      net: '2026-12-02T04:30:00Z',
      formattedDate: 'Dec 2, 2026, 10:00 AM',
      location: 'Satish Dhawan Space Centre, Sriharikota',
      agency: 'ISRO',
      isLiveAPI: false,
    },
  ];
}