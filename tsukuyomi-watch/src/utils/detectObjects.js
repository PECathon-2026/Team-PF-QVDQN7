/**
 * Dojo Object Finder - bright-point detector (plain JavaScript, no extra libraries).
 *
 * HOW IT WORKS (simple version):
 * 1. Turn the picture into brightness values (0 = black, 255 = white).
 * 2. Pick a brightness threshold: average brightness + a few "standard deviations".
 * 3. Group touching bright pixels into blobs (this is called connected-component labeling).
 * 4. Report each blob's centre position, pixel area and peak brightness.
 *
 * HONESTY NOTES:
 * - These are CANDIDATE bright regions, not confirmed stars, planets or galaxies.
 * - Pixel area is NOT a physical size.
 * - "Relative intensity" is peak brightness as a % of the maximum (255), NOT calibrated brightness.
 */

const MIN_AREA_PIXELS = 2; // single bright pixels are ignored (likely sensor noise)
const MAX_AREA_FRACTION = 0.01; // blobs bigger than 1% of the image (clouds, city glow) are skipped
const MAX_OBJECTS_SHOWN = 40;

/**
 * Core detector. Works on plain numbers so it is easy to test.
 * @param {Uint8Array} lum - brightness of every pixel (length = width * height)
 */
export function findBrightObjects(lum, width, height, options = {}) {
  const { sigma = 3.5, maxObjects = MAX_OBJECTS_SHOWN } = options;
  const total = width * height;

  // Step 1: average brightness and spread of the whole image
  let sum = 0;
  for (let i = 0; i < total; i++) sum += lum[i];
  const mean = sum / total;

  let varianceSum = 0;
  for (let i = 0; i < total; i++) {
    const diff = lum[i] - mean;
    varianceSum += diff * diff;
  }
  const std = Math.sqrt(varianceSum / total);

  // Step 2: threshold (never below 50, never above 240)
  const threshold = Math.min(240, Math.max(50, mean + sigma * std));

  // Step 3: mark bright pixels
  const mask = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    mask[i] = lum[i] >= threshold ? 1 : 0;
  }

  // Step 4: group touching bright pixels (8 directions) using a stack, not recursion
  const visited = new Uint8Array(total);
  const stack = new Int32Array(total);
  const maxArea = Math.max(50, Math.floor(total * MAX_AREA_FRACTION));
  const found = [];
  let skippedLarge = 0;

  for (let start = 0; start < total; start++) {
    if (!mask[start] || visited[start]) continue;

    let sp = 0;
    stack[sp++] = start;
    visited[start] = 1;

    let area = 0;
    let sumX = 0;
    let sumY = 0;
    let peak = 0;

    while (sp > 0) {
      const idx = stack[--sp];
      const x = idx % width;
      const y = (idx - x) / width;

      area++;
      sumX += x;
      sumY += y;
      if (lum[idx] > peak) peak = lum[idx];

      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const nIdx = ny * width + nx;
          if (mask[nIdx] && !visited[nIdx]) {
            visited[nIdx] = 1;
            stack[sp++] = nIdx;
          }
        }
      }
    }

    if (area < MIN_AREA_PIXELS) continue;
    if (area > maxArea) {
      skippedLarge++;
      continue;
    }

    found.push({
      x: Math.round(sumX / area),
      y: Math.round(sumY / area),
      area,
      peak,
      intensity: Math.round((peak / 255) * 100),
    });
  }

  // Step 5: brightest first, then number them 1, 2, 3...
  found.sort((a, b) => b.peak - a.peak || b.area - a.area);
  const objects = found.slice(0, maxObjects).map((obj, i) => ({ id: i + 1, ...obj }));

  // Median area (middle value) of everything found
  let medianArea = 0;
  if (found.length > 0) {
    const areas = found.map((o) => o.area).sort((a, b) => a - b);
    const mid = Math.floor(areas.length / 2);
    medianArea = areas.length % 2 ? areas[mid] : Math.round((areas[mid - 1] + areas[mid]) / 2);
  }

  return {
    width,
    height,
    objects,
    totalFound: found.length,
    skippedLarge,
    medianArea,
    threshold: Math.round(threshold),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image for detection.'));
    img.src = src;
  });
}

/**
 * Browser helper: takes an image (data URL), reads its pixels, and runs the detector.
 * Images larger than 1200 px are shrunk first so detection stays fast.
 */
export async function detectBrightObjects(imageSrc, options = {}) {
  const { maxDimension = 1200 } = options;
  const img = await loadImage(imageSrc);

  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDimension / Math.max(naturalW, naturalH));
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const lum = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    lum[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  return findBrightObjects(lum, width, height, options);
}
