import type { ConversionReport, OutputFile, ParsedTexture } from '../../types/conversion';
import type { FileMappingEntry } from '../../types/mappings';
import { inspectImage } from '../image/decodeImage';
import { addReportEntry, addWarning } from '../report/createConversionReport';

export async function convertFileTextures(
  textures: readonly ParsedTexture[],
  resolveMapping: (id: string) => FileMappingEntry | undefined,
  report: ConversionReport,
  processed: Set<string>,
): Promise<OutputFile[]> {
  const output: OutputFile[] = [];

  for (const texture of textures) {
    const mapping = resolveMapping(texture.canonicalId);
    if (!mapping) continue;
    processed.add(texture.sourcePath);
    try {
      const dimensions = await inspectImage(texture.blob);
      for (const path of mapping.destinations) output.push({ path, blob: texture.blob });
      addReportEntry(report, {
        sourcePath: texture.sourcePath,
        canonicalId: mapping.id,
        destination: mapping.destinations.join(', '),
        status: 'converted',
        sourceResolution: `${dimensions.width}x${dimensions.height}`,
        outputResolution: `${dimensions.width}x${dimensions.height}`,
      });
    } catch (error) {
      addWarning(report, {
        code: 'invalid-png',
        messageKey: 'warnings.invalidPng',
        path: texture.sourcePath,
        detail: error instanceof Error ? error.message : undefined,
      });
      addReportEntry(report, {
        sourcePath: texture.sourcePath,
        canonicalId: mapping.id,
        status: 'skipped',
      });
    }
  }

  return output;
}
