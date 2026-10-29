const STORAGE_KEY = 'tsukuyomi_honor_points_data';

// In-memory fallback if localStorage is disabled or throws
let memoryStore = {
  totalPoints: 0,
  observedEventIds: [],
};

export function getHonorData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryStore;
    const parsed = JSON.parse(raw);
    return {
      totalPoints: typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0,
      observedEventIds: Array.isArray(parsed.observedEventIds) ? parsed.observedEventIds : [],
    };
  } catch (e) {
    return memoryStore;
  }
}

export function recordObservation(eventId, pointValue = 10) {
  const current = getHonorData();

  // Guard against duplicate points for the same event
  if (current.observedEventIds.includes(eventId)) {
    return { success: false, ...current };
  }

  const updated = {
    totalPoints: current.totalPoints + pointValue,
    observedEventIds: [...current.observedEventIds, eventId],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // Save to memory store on storage failure
    memoryStore = updated;
  }

  return { success: true, ...updated };
}