/**
 * Calculates the Night Honor Score based on weather conditions.
 * Formula from Tsukuyomi Watch specification:
 * - C: Cloud cover (0–100%)
 * - V: Visibility in meters (normalized: min(100, (V / 20000) * 100))
 * - H: Relative humidity (0–100%)
 * 
 * Score = 0.50 * (100 - C) + 0.30 * V_score + 0.20 * (100 - H)
 */
export function calculateNightHonorScore({ cloudCover, visibilityMeters, humidity }) {
  if (
    cloudCover === undefined ||
    visibilityMeters === undefined ||
    humidity === undefined ||
    isNaN(cloudCover) ||
    isNaN(visibilityMeters) ||
    isNaN(humidity)
  ) {
    return null;
  }

  const visibilityScore = Math.min(100, (visibilityMeters / 20000) * 100);

  const rawScore =
    0.5 * (100 - cloudCover) +
    0.3 * visibilityScore +
    0.2 * (100 - humidity);

  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  let label = 'Poor forecast conditions';
  let color = '#ff6b6b';

  if (finalScore >= 80) {
    label = 'Excellent forecast conditions';
    color = '#51cf66';
  } else if (finalScore >= 60) {
    label = 'Good forecast conditions';
    color = '#d4af37';
  } else if (finalScore >= 40) {
    label = 'Mixed conditions';
    color = '#fcc419';
  }

  return {
    score: finalScore,
    label,
    color,
    visibilityScore: Math.round(visibilityScore),
  };
}