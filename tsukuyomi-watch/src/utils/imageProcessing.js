/**
 * Lightweight browser-side astronomical image processing utility.
 * Applies honest contrast enhancement, light noise reduction, and edge sharpening using Canvas.
 * Everything here is conventional, deterministic image processing - NOT generative AI.
 */
export function processAstroImage(imageElement, settings = {}) {
  const {
    contrast = 1.2,
    brightness = 5,
    sharpen = true,
    denoise = true,
    maxDimension = 1200,
  } = settings;

  let width = imageElement.naturalWidth || imageElement.width;
  let height = imageElement.naturalHeight || imageElement.height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Brightness & Contrast Adjustment
  const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128 + brightness;
    data[i + 1] = factor * (data[i + 1] - 128) + 128 + brightness;
    data[i + 2] = factor * (data[i + 2] - 128) + 128 + brightness;
  }

  // 2. Light noise reduction: blend each pixel 50/50 with the average of its 3x3 neighbours
  if (denoise) {
    const before = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          let total = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              total += before[((y + ky) * width + (x + kx)) * 4 + c];
            }
          }
          data[idx + c] = 0.5 * before[idx + c] + 0.5 * (total / 9);
        }
      }
    }
  }

  // 3. Sharpening convolution filter
  if (sharpen) {
    const srcData = new Uint8ClampedArray(data);
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0,
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const dstIdx = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;
        let kIdx = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const srcIdx = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[kIdx++];
            r += srcData[srcIdx] * weight;
            g += srcData[srcIdx + 1] * weight;
            b += srcData[srcIdx + 2] * weight;
          }
        }

        data[dstIdx] = Math.min(255, Math.max(0, r));
        data[dstIdx + 1] = Math.min(255, Math.max(0, g));
        data[dstIdx + 2] = Math.min(255, Math.max(0, b));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}
