export const MAX_CANVAS_DIMENSION = 16_384;

export function assertCanvasSize(width: number, height: number): void {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    width > MAX_CANVAS_DIMENSION ||
    height > MAX_CANVAS_DIMENSION
  ) {
    throw new Error(`canvas-limit:${width}x${height}`);
  }
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  assertCanvasSize(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('canvas-context-unavailable');
  context.imageSmoothingEnabled = false;
  return context;
}

export async function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('png-encode-failed'));
    }, 'image/png');
  });
}
