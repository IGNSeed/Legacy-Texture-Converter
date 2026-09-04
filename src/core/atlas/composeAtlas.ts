import type { ConversionReport, ParsedTexture } from '../../types/conversion';
import type { AtlasMappingDocument } from '../../types/mappings';
import { addReportEntry, addWarning } from '../report/createConversionReport';
import { canvasToPng, createCanvas, getCanvasContext } from '../image/canvas';
import { decodeImage } from '../image/decodeImage';
import { drawTextureSlot } from '../image/drawTextureSlot';
import type { EditionMappings } from '../mappings/createEditionMappings';

export interface ComposeAtlasOptions {
  base: Blob;
  mapping: AtlasMappingDocument;
  textures: readonly ParsedTexture[];
  targetSlotSize: number;
  destination: string;
  report: ConversionReport;
  processed: Set<string>;
  resolveMapping: EditionMappings['resolveAtlasMapping'];
}

export function atlasOutputDimensions(
  mapping: AtlasMappingDocument,
  targetSlotSize: number,
): { width: number; height: number; scale: number } {
  const scale = targetSlotSize / mapping.atlas.slotSize;
  return {
    width: Math.round(mapping.atlas.width * scale),
    height: Math.round(mapping.atlas.height * scale),
    scale,
  };
}

export async function composeAtlas(options: ComposeAtlasOptions): Promise<Blob> {
  const {
    base,
    mapping,
    textures,
    targetSlotSize,
    destination,
    report,
    processed,
    resolveMapping,
  } = options;
  const output = atlasOutputDimensions(mapping, targetSlotSize);
  const canvas = createCanvas(output.width, output.height);
  const context = getCanvasContext(canvas);
  const baseImage = await decodeImage(base);

  try {
    context.drawImage(baseImage.source, 0, 0, output.width, output.height);
  } finally {
    baseImage.close();
  }

  for (const texture of textures) {
    const entry = resolveMapping(mapping.category, texture.canonicalId);
    if (!entry) continue;
    processed.add(texture.sourcePath);

    try {
      const image = await decodeImage(texture.blob);
      try {
        if (image.width !== image.height && image.height % image.width !== 0) {
          addWarning(report, {
            code: 'non-square-texture',
            messageKey: 'warnings.nonSquare',
            path: texture.sourcePath,
          });
          addReportEntry(report, {
            sourcePath: texture.sourcePath,
            canonicalId: entry.id,
            destination,
            status: 'skipped',
            sourceResolution: `${image.width}x${image.height}`,
          });
          continue;
        }

        for (const position of entry.positions) {
          drawTextureSlot(
            context,
            image,
            Math.round(position.x * output.scale),
            Math.round(position.y * output.scale),
            targetSlotSize,
          );
        }

        const sourceSize = image.width;
        const wasResized = sourceSize !== targetSlotSize;
        addReportEntry(report, {
          sourcePath: texture.sourcePath,
          canonicalId: entry.id,
          destination,
          status: wasResized ? 'resized' : 'converted',
          sourceResolution: `${image.width}x${image.height}`,
          outputResolution: `${targetSlotSize}x${targetSlotSize}`,
        });
      } finally {
        image.close();
      }
    } catch (error) {
      addWarning(report, {
        code: 'invalid-png',
        messageKey: 'warnings.invalidPng',
        path: texture.sourcePath,
        detail: error instanceof Error ? error.message : undefined,
      });
      addReportEntry(report, {
        sourcePath: texture.sourcePath,
        canonicalId: entry.id,
        destination,
        status: 'skipped',
      });
    }
  }

  return canvasToPng(canvas);
}
