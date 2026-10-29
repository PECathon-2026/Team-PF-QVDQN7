/**
 * Fetches forecast weather from Open-Meteo for astronomy observation planning.
 * Finds the upcoming nighttime forecast slot.
 */
export async function getStargazingWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=cloud_cover,relative_humidity_2m,visibility,precipitation_probability&forecast_days=2&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  const { hourly } = data;

  if (!hourly || !hourly.time || hourly.time.length === 0) {
    throw new Error('No hourly forecast data returned.');
  }

  // Find the closest upcoming nighttime hour (between 20:00 and 04:00) or closest future hour
  const now = new Date();
  let selectedIndex = 0;

  for (let i = 0; i < hourly.time.length; i++) {
    const slotTime = new Date(hourly.time[i]);
    if (slotTime >= now) {
      const hour = slotTime.getHours();
      // Prefer night hours (8 PM - 4 AM)
      if (hour >= 20 || hour <= 4) {
        selectedIndex = i;
        break;
      }
      if (selectedIndex === 0) {
        selectedIndex = i;
      }
    }
  }

  return {
    time: hourly.time[selectedIndex],
    cloudCover: hourly.cloud_cover[selectedIndex],
    humidity: hourly.relative_humidity_2m[selectedIndex],
    visibility: hourly.visibility[selectedIndex], // meters
    precipitationProbability: hourly.precipitation_probability[selectedIndex],
  };
}