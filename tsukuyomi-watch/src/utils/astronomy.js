import * as SunCalc from 'suncalc';

/**
 * Calculates moon ephemeris and phase details.
 * Formats primary output in clear English, with Japanese naming as an aesthetic subtitle.
 * Supports hemisphere-aware moon rendering.
 */
export function getMoonDetails(date = new Date(), latitude = 0, longitude = 0, timezone = 'UTC') {
  const illumination = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);

  const phase = illumination.phase; // 0.0 to 1.0
  const isSouthernHemisphere = latitude < 0;

  let phaseName = 'New Moon';
  let icon = '🌑';
  let jpName = '新月 • Shingetsu';

  if (phase > 0.03 && phase < 0.22) {
    phaseName = 'Waxing Crescent';
    icon = isSouthernHemisphere ? '🌘' : '🌒';
    jpName = '三日月 • Mikazuki';
  } else if (phase >= 0.22 && phase <= 0.28) {
    phaseName = 'First Quarter';
    icon = isSouthernHemisphere ? '🌗' : '🌓';
    jpName = '上弦の月 • Jōgen no Tsuki';
  } else if (phase > 0.28 && phase < 0.47) {
    phaseName = 'Waxing Gibbous';
    icon = isSouthernHemisphere ? '🌖' : '🌔';
    jpName = '十三夜 • Jūsan-ya';
  } else if (phase >= 0.47 && phase <= 0.53) {
    phaseName = 'Full Moon';
    icon = '🌕';
    jpName = '満月 • Mangetsu';
  } else if (phase > 0.53 && phase < 0.72) {
    phaseName = 'Waning Gibbous';
    icon = isSouthernHemisphere ? '🌔' : '🌖';
    jpName = '十六夜 • Izayoi';
  } else if (phase >= 0.72 && phase <= 0.78) {
    phaseName = 'Last Quarter';
    icon = isSouthernHemisphere ? '🌓' : '🌗';
    jpName = '下弦の月 • Kagen no Tsuki';
  } else if (phase > 0.78 && phase < 0.97) {
    phaseName = 'Waning Crescent';
    icon = isSouthernHemisphere ? '🌒' : '🌘';
    jpName = '有明の月 • Ariake no Tsuki';
  }

  const formatTime = (timeDate) => {
    if (!timeDate || isNaN(new Date(timeDate).getTime())) {
      return 'No occurrence today';
    }
    try {
      return new Date(timeDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone || 'UTC',
      });
    } catch (e) {
      return new Date(timeDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return {
    fraction: Math.round(illumination.fraction * 100),
    phaseValue: phase.toFixed(2),
    phaseName,
    jpName,
    icon,
    hemisphere: isSouthernHemisphere ? 'Southern' : 'Northern',
    moonrise: formatTime(moonTimes.rise),
    moonset: formatTime(moonTimes.set),
  };
}