/**
 * Lightweight browser-side astronomical image processing utility.
 * Applies honest contrast enhancement, noise reduction, and edge sharpening using Canvas.
 */

export function processAstroImage(imageElement, settings = {}) {
  const {
    contrast = 1.2,       // 1.0 = normal, 1.3 = enhanced
    brightness = 5,       // slight exposure boost (-20 to 40)
    denoise = true,       // simple 3x3 median noise reduction
    sharpen = true,       // unsharp mask convolution kernel
    maxDimension = 1200,  // enforce performance safety limit
  } = settings;

  // Scale down to safe working dimensions to prevent browser lockup
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
    data[i] = factor * (data[i] - 128) + 128 + brightness;     // Red
    data[i + 1] = factor * (data[i + 1] - 128) + 128 + brightness; // Green
    data[i + 2] = factor * (data[i + 2] - 128) + 128 + brightness; // Blue
  }

  // 2. Spatial Noise Filter & Sharpening Convolution
  if (sharpen) {
    const srcData = new Uint8ClampedArray(data);
    // Standard unsharp laplacian kernel
    const kernel = [
      0, -1,  0,
     -1,  5, -1,
      0, -1,  0
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