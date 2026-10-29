/**
 * Astronomical utility to compute the Local Zenith coordinates (RA, Dec)
 * for a specific latitude, longitude, and timestamp.
 */

// Format decimal degrees to astronomical Hours, Minutes, Seconds (HHh MMm SSs)
export function degreesToRAString(deg) {
  const normalized = ((deg % 360) + 360) % 360;
  const hoursDecimal = normalized / 15;
  const h = Math.floor(hoursDecimal);
  const m = Math.floor((hoursDecimal - h) * 60);
  const s = Math.round(((hoursDecimal - h) * 60 - m) * 60);
  return `${h}h ${m}m ${s}s`;
}

// Format decimal degrees to Degrees, Arcminutes, Arcseconds (+/-DD° MM' SS")
export function degreesToDecString(deg) {
  const sign = deg >= 0 ? '+' : '-';
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = Math.round(((abs - d) * 60 - m) * 60);
  return `${sign}${d}° ${m}' ${s}"`;
}

export function getLocalZenithCoordinates(latitude, longitude, date = new Date()) {
  // 1. Dec of Zenith is identical to the observer's latitude
  const dec = latitude;

  // 2. Compute Julian Date from UTC milliseconds
  const timeMs = date.getTime();
  const jd = timeMs / 86400000 + 2440587.5;

  // 3. Days since J2000.0 epoch
  const d = jd - 2451545.0;

  // 4. Greenwich Mean Sidereal Time (GMST) in degrees (IAU formula)
  let gmst = 280.46061837 + 360.98564736629 * d;
  gmst = ((gmst % 360) + 360) % 360;

  // 5. Local Sidereal Time (LST) = GMST + Longitude (East positive)
  let lst = gmst + longitude;
  lst = ((lst % 360) + 360) % 360;

  // 6. Right Ascension of Zenith = Local Sidereal Time
  const ra = lst;

  // 7. Formulate NASA SkyView RunQuery URL (Optical Digitized Sky Survey)
  const skyViewUrl = `https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl?Position=${ra.toFixed(4)},${dec.toFixed(4)}&Survey=DSS&Pixels=450&Size=1.5&Scaling=Log`;

  return {
    raDegrees: ra,
    decDegrees: dec,
    raFormatted: degreesToRAString(ra),
    decFormatted: degreesToDecString(dec),
    skyViewUrl,
  };
}