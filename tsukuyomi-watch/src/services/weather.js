export async function getStargazingWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=cloud_cover,relative_humidity_2m,visibility,precipitation_probability&forecast_days=2&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather fetch failed: ${response.statusText}`);

  const data = await response.json();
  const { hourly } = data;
  if (!hourly || !hourly.time || hourly.time.length === 0) {
    throw new Error('No hourly forecast data returned.');
  }

  const now = new Date();
  let selectedIndex = 0;

  // Find the primary representative night hour (existing behavior)
  for (let i = 0; i < hourly.time.length; i++) {
    const slotTime = new Date(hourly.time[i]);
    if (slotTime >= now) {
      const hour = slotTime.getHours();
      if (hour >= 20 || hour <= 4) {
        selectedIndex = i;
        break;
      }
      if (selectedIndex === 0) selectedIndex = i;
    }
  }

  // Extract upcoming night hours for tonight (from now onwards, focusing on night hours)
  // Grabs up to the next 12 hours that fall between 18:00 (6 PM) and 06:00 (6 AM)
  const hourlyTonight = [];
  for (let i = 0; i < hourly.time.length; i++) {
    const slotTime = new Date(hourly.time[i]);
    // Include slots starting from 1 hour in the past up to 24 hours ahead
    if (slotTime.getTime() >= now.getTime() - 60 * 60 * 1000) {
      const hour = slotTime.getHours();
      // Night and astronomical dusk/dawn hours: 18:00 to 06:00
      if (hour >= 18 || hour <= 6) {
        hourlyTonight.push({
          time: hourly.time[i],
          hourNumber: hour,
          cloudCover: hourly.cloud_cover[i],
          humidity: hourly.relative_humidity_2m[i],
          visibility: hourly.visibility[i],
          precipitationProbability: hourly.precipitation_probability[i],
        });
      }
    }
    // Limit to the next 12 night slots to cover dusk-to-dawn
    if (hourlyTonight.length >= 12) break;
  }

  return {
    time: hourly.time[selectedIndex],
    cloudCover: hourly.cloud_cover[selectedIndex],
    humidity: hourly.relative_humidity_2m[selectedIndex],
    visibility: hourly.visibility[selectedIndex],
    precipitationProbability: hourly.precipitation_probability[selectedIndex],
    hourlyTonight,
  };
}