/** Canvas helpers for signature capture and typed signatures. */

export function isCanvasBlank(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext('2d');
  if (!context || !canvas.width || !canvas.height) return true;
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] !== 0) return false;
  }
  return true;
}

export interface TrimCanvasOptions {
  padding?: number;
  type?: string;
  quality?: number;
}

/**
 * Export a canvas as a data URL, cropped to the visible ink with a little
 * padding. Keeps signatures tight when placed into a PDF.
 */
export function canvasToTrimmedDataUrl(canvas: HTMLCanvasElement, options: TrimCanvasOptions = {}): string {
  const context = canvas.getContext('2d');
  if (!context || !canvas.width || !canvas.height) return '';

  const { width, height } = canvas;
  const image = context.getImageData(0, 0, width, height);
  const { data } = image;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha === 0) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) return '';

  const padding = options.padding ?? 8;
  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const output = document.createElement('canvas');
  output.width = cropWidth + padding * 2;
  output.height = cropHeight + padding * 2;

  const outputContext = output.getContext('2d');
  if (!outputContext) return '';
  outputContext.drawImage(canvas, minX, minY, cropWidth, cropHeight, padding, padding, cropWidth, cropHeight);

  return output.toDataURL(options.type ?? 'image/png', options.quality);
}

/** Turn typed text into a trimmed, transparent PNG data URL. */
export function renderTypedSignature(text: string, font: string): string {
  if (!text.trim()) return '';

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 360;
  const context = canvas.getContext('2d');
  if (!context) return '';

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = font;
  context.fillStyle = '#1f2937';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const metrics = context.measureText(text);
  const maxWidth = canvas.width - 80;
  if (metrics.width > maxWidth) {
    const scale = maxWidth / metrics.width;
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(scale, scale);
    context.fillText(text, 0, 0);
    context.restore();
  } else {
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  return canvasToTrimmedDataUrl(canvas, { padding: 12 });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
