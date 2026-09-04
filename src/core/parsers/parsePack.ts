import type { ParsedPack, SourceEdition, VirtualFile } from '../../types/conversion';
import { parseBedrockPack } from './bedrock/parseBedrockPack';
import { parseJavaPack } from './java/parseJavaPack';

export function parsePack(
  name: string,
  files: readonly VirtualFile[],
  edition: Exclude<SourceEdition, 'unknown'>,
): Promise<ParsedPack> {
  return edition === 'java' ? parseJavaPack(name, files) : parseBedrockPack(name, files);
}
