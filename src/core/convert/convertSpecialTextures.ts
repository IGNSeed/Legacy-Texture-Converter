import type { ConversionReport, OutputFile, ParsedTexture } from '../../types/conversion';
import { inspectImage } from '../image/decodeImage';
import { generateMipmaps } from '../mipmap/generateMipmaps';
import type { EditionMappings } from '../mappings/createEditionMappings';
import { addReportEntry, addWarning } from '../report/createConversionReport';
import { createLceAnimationText } from './animationMetadata';

export async function convertSpecialTextures(
  textures: readonly ParsedTexture[],
  report: ConversionReport,
  processed: Set<string>,
  resolveMapping: EditionMappings['resolveSpecialMapping'],
  mipmapPath: (destination: string, level: number) => string,
): Promise<OutputFile[]> {
  const output: OutputFile[] = [];

  for (const texture of textures) {
    const mapping = resolveMapping(texture.canonicalId);
    if (!mapping) continue;
    processed.add(texture.sourcePath);
    try {
      const { width, height } = await inspectImage(texture.blob);
      output.push({ path: mapping.destination, blob: texture.blob });

      if (mapping.animationText && texture.animationMetadata) {
        const frameSize = Math.max(1, width);
        const text = createLceAnimationText(
          texture.animationMetadata,
          Math.max(1, height / frameSize),
        );
        if (text) {
          output.push({
            path: mapping.animationText,
            blob: new Blob([text], { type: 'text/plain' }),
          });
        } else {
          addWarning(report, {
            code: 'unknown-animation',
            messageKey: 'warnings.animation',
            path: texture.sourcePath,
          });
        }
      } else if (texture.animationMetadata && mapping.animationMode === 'fixed') {
        addWarning(report, {
          code: 'fixed-animation-order',
          messageKey: 'warnings.animationFixedOrder',
          path: texture.sourcePath,
        });
      }

      if (mapping.mipmapLevels) {
        const mipmaps = await generateMipmaps(
          texture.blob,
          width,
          height,
          mapping.mipmapLevels,
          mapping.mipmapMinimumWidth,
          mapping.mipmapMinimumHeight,
        );
        mipmaps.forEach((blob, index) => {
          output.push({ path: mipmapPath(mapping.destination, index + 1), blob });
        });
      }

      addReportEntry(report, {
        sourcePath: texture.sourcePath,
        canonicalId: mapping.id,
        destination: mapping.destination,
        status: 'converted',
        sourceResolution: `${width}x${height}`,
        outputResolution: `${width}x${height}`,
      });
    } catch (error) {
      addWarning(report, {
        code: 'invalid-special-texture',
        messageKey: 'warnings.invalidPng',
        path: texture.sourcePath,
        detail: error instanceof Error ? error.message : undefined,
      });
      addReportEntry(report, {
        sourcePath: texture.sourcePath,
        canonicalId: mapping.id,
        destination: mapping.destination,
        status: 'skipped',
      });
    }
  }

  return output;
}
