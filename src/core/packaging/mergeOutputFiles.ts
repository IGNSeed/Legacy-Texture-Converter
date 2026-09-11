import type { OutputFile } from '../../types/conversion';
import { normalizeArchivePath } from '../files/normalizeArchivePath';
import { isArmorPowerTexturePath } from './outputFilePolicy';

export function mergeOutputFiles(
  defaults: readonly OutputFile[],
  overrides: readonly OutputFile[],
): OutputFile[] {
  const files = new Map<string, Blob>();
  for (const file of [...defaults, ...overrides]) {
    const path = normalizeArchivePath(file.path);
    if (isArmorPowerTexturePath(path)) continue;
    files.set(path, file.blob);
  }
  return [...files].map(([path, blob]) => ({ path, blob }));
}
