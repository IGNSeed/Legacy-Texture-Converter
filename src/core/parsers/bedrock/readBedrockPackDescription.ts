import type { VirtualFile } from '../../../types/conversion';
import { asRecord, nonBlankString, readPackMetadataValue } from '../packMetadata';

function isBedrockPackContent(relativePath: string): boolean {
  return relativePath.startsWith('textures/');
}

export function readBedrockPackDescription(
  files: readonly VirtualFile[],
): Promise<string | undefined> {
  return readPackMetadataValue(files, 'manifest.json', isBedrockPackContent, (metadata) => {
    const header = asRecord(asRecord(metadata)?.header);
    return nonBlankString(header?.description);
  });
}
