import type { ParsedTexture } from '../../types/conversion';
import type { ConversionReport } from '../../types/conversion';
import type { AtlasMappingDocument } from '../../types/mappings';
import { inspectImage } from '../image/decodeImage';
import { MAX_CANVAS_DIMENSION } from '../image/canvas';

export interface TextureDimensions {
  texture: ParsedTexture;
  width: number;
  height: number;
}

export function isPowerOfTwo(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

export async function inspectTextures(
  textures: readonly ParsedTexture[],
): Promise<TextureDimensions[]> {
  const dimensions: TextureDimensions[] = [];
  for (const texture of textures) {
    try {
      const size = await inspectImage(texture.blob);
      dimensions.push({ texture, ...size });
    } catch {
      // A corrupt image is recorded during conversion, where the report has full context.
    }
  }
  return dimensions;
}

function squarePowerOfTwoSizes(entries: readonly TextureDimensions[]): number[] {
  return entries
    .filter((entry) => entry.width === entry.height && isPowerOfTwo(entry.width))
    .map((entry) => entry.width);
}

export function resolveItemResolution(
  entries: readonly TextureDimensions[],
  report?: ConversionReport,
  mapping?: AtlasMappingDocument,
): number {
  const sizes = squarePowerOfTwoSizes(entries);
  if (sizes.length === 0) return 16;
  const distinct = [...new Set(sizes)];
  if (distinct.length > 1) {
    report?.warnings.push({ code: 'mixed-item-resolution', messageKey: 'warnings.mixedItems' });
  }
  const target = Math.max(16, ...sizes);
  const atlas = mapping?.atlas ?? { width: 256, height: 272, slotSize: 16 };
  if (
    atlas.width * (target / atlas.slotSize) > MAX_CANVAS_DIMENSION ||
    atlas.height * (target / atlas.slotSize) > MAX_CANVAS_DIMENSION
  ) {
    throw new Error(`canvas-limit:item:${target}`);
  }
  return target;
}

export function resolveBlockResolution(
  entries: readonly TextureDimensions[],
  report?: ConversionReport,
): 16 | 32 {
  const sizes = squarePowerOfTwoSizes(entries);
  if (sizes.length === 0) return 16;
  const distinct = [...new Set(sizes)];
  if (distinct.length > 1) {
    report?.warnings.push({ code: 'mixed-block-resolution', messageKey: 'warnings.mixedBlocks' });
  }
  return sizes.some((size) => size > 16) ? 32 : 16;
}

export function resolveParticleResolution(
  entries: readonly TextureDimensions[],
  mapping?: AtlasMappingDocument,
): number {
  const sizes = squarePowerOfTwoSizes(entries);
  if (sizes.length === 0) return 8;
  const target = Math.max(8, ...sizes);
  const atlas = mapping?.atlas ?? { width: 128, height: 128, slotSize: 8 };
  const scale = target / atlas.slotSize;
  if (atlas.width * scale > MAX_CANVAS_DIMENSION || atlas.height * scale > MAX_CANVAS_DIMENSION) {
    throw new Error(`canvas-limit:particles:${target}`);
  }
  return target;
}
