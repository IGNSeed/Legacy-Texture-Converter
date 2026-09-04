import type { DecodedImage } from './decodeImage';

export function drawTextureSlot(
  context: CanvasRenderingContext2D,
  image: DecodedImage,
  x: number,
  y: number,
  size: number,
): void {
  const frameSize = Math.min(image.width, image.height);
  context.drawImage(image.source, 0, 0, frameSize, frameSize, x, y, size, size);
}
