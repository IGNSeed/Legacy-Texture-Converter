import type { ConversionReport, OutputFile, ParsedTexture } from '../../types/conversion';
import { inspectImage } from '../image/decodeImage';
import { generateMipmaps } from '../mipmap/generateMipmaps';
import { resolveSpecialMapping } from '../mappings/wiiuMappings';
import { addReportEntry, addWarning } from '../report/createConversionReport';
import { specialMipmapPath } from '../editions/wiiu/paths';
import { createLceAnimationText } from './animationMetadata';

export async function convertSpecialTextures(
  textures: readonly ParsedTexture[],
  report: ConversionReport,
  processed: Set<string>,
): Promise<OutputFile[]> {
  const output: OutputFile[] = [];

  for (const texture of textures) {
    const mapping = resolveSpecialMapping(texture.canonicalId);
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
      }

      if (mapping.mipmapLevels) {
        const mipmaps = await generateMipmaps(texture.blob, width, height, mapping.mipmapLevels);
        mipmaps.forEach((blob, index) => {
          output.push({ path: specialMipmapPath(mapping.destination, index + 1), blob });
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
