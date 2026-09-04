import { resizePixelTexture } from '../image/resizePixelTexture';

export function mipmapDimensions(
  width: number,
  height: number,
  level: number,
  minimumWidth = 1,
  minimumHeight = 1,
): {
  width: number;
  height: number;
} {
  const divisor = 2 ** level;
  return {
    width: Math.max(minimumWidth, Math.floor(width / divisor)),
    height: Math.max(minimumHeight, Math.floor(height / divisor)),
  };
}

export async function generateMipmaps(
  source: Blob,
  width: number,
  height: number,
  levels: number,
  minimumWidth = 1,
  minimumHeight = 1,
): Promise<Blob[]> {
  const output: Blob[] = [];
  for (let level = 1; level <= levels; level += 1) {
    const size = mipmapDimensions(width, height, level, minimumWidth, minimumHeight);
    output.push(await resizePixelTexture(source, size.width, size.height));
  }
  return output;
}
