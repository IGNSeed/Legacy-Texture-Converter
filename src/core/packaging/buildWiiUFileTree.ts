import type { OutputFile } from '../../types/conversion';
import { normalizeArchivePath } from '../files/normalizeArchivePath';

export function buildWiiUFileTree(
  defaults: readonly OutputFile[],
  overrides: readonly OutputFile[],
): OutputFile[] {
  const files = new Map<string, Blob>();
  for (const file of [...defaults, ...overrides]) {
    const path = normalizeArchivePath(file.path);
    files.set(path, file.blob);
  }
  return [...files].map(([path, blob]) => ({ path, blob }));
}
