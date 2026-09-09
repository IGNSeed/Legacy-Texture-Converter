import type { ConversionReport, ItemResolution, ParsedTexture } from '../../types/conversion';
import type { AtlasMappingDocument } from '../../types/mappings';
import { inspectImage } from '../image/decodeImage';
import { MAX_CANVAS_DIMENSION } from '../image/canvas';

export interface TextureDimensions {
  texture: ParsedTexture;
  width: number;
  height: number;
}

export const ITEM_RESOLUTION_OPTIONS = [
  16, 32, 64, 128, 256,
] as const satisfies readonly ItemResolution[];

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

function detectedItemResolution(
  entries: readonly TextureDimensions[],
  report?: ConversionReport,
): number {
  const sizes = squarePowerOfTwoSizes(entries);
  if (sizes.length === 0) return 16;
  if (new Set(sizes).size > 1) {
    report?.warnings.push({ code: 'mixed-item-resolution', messageKey: 'warnings.mixedItems' });
  }
  return Math.max(16, ...sizes);
}

export function itemResolutionForMaximum(maximum?: number): ItemResolution {
  if (maximum === undefined || !isPowerOfTwo(maximum) || maximum <= 16) return 16;
  if (maximum >= 256) return 256;
  if (maximum >= 128) return 128;
  if (maximum >= 64) return 64;
  return 32;
}

export function resolveSuggestedItemResolution(
  entries: readonly TextureDimensions[],
): ItemResolution {
  return itemResolutionForMaximum(detectedItemResolution(entries));
}

export function resolveItemResolution(
  entries: readonly TextureDimensions[],
  report?: ConversionReport,
  mapping?: AtlasMappingDocument,
  requestedResolution?: ItemResolution,
): number {
  if (requestedResolution !== undefined && !ITEM_RESOLUTION_OPTIONS.includes(requestedResolution)) {
    throw new Error(`invalid-item-resolution:${requestedResolution}`);
  }
  const detectedResolution = detectedItemResolution(entries, report);
  const target = requestedResolution ?? detectedResolution;
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
