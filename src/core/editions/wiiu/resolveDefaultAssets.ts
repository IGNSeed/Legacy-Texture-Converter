import manifestJson from '../../../../data/mappings/wiiu/default-assets.json';
import type { OutputFile, VirtualFile } from '../../../types/conversion';
import { normalizeArchivePath } from '../../files/normalizeArchivePath';

const manifest = manifestJson as { files: string[] };
const canonicalPaths = new Map(manifest.files.map((path) => [path.toLowerCase(), path]));

function sourcePriority(path: string): number {
  const lower = path.toLowerCase();
  const segments = lower.split('/').map((segment) => segment.replace(/\.(zip|mcpack)$/, ''));
  if (segments.some((segment) => segment === 'upd' || segment.includes('wiiu(upd)'))) return 2;
  if (segments.some((segment) => segment === 'base' || segment.includes('wiiu(base)'))) return 0;
  return 1;
}

function outputPath(path: string): string | undefined {
  const normalized = normalizeArchivePath(path);
  const lower = normalized.toLowerCase();
  const index = lower.indexOf('common/res/');
  if (index < 0) return undefined;
  return canonicalPaths.get(lower.slice(index));
}

export interface BaselineResolution {
  files: OutputFile[];
  missing: string[];
}

export function resolveDefaultAssets(files: readonly VirtualFile[]): BaselineResolution {
  const resolved = new Map<string, Blob>();
  for (const file of [...files].sort(
    (left, right) => sourcePriority(left.path) - sourcePriority(right.path),
  )) {
    const path = outputPath(file.path);
    if (path) resolved.set(path, file.blob);
  }

  return {
    files: [...resolved].map(([path, blob]) => ({ path, blob })),
    missing: manifest.files.filter((path) => !resolved.has(path)),
  };
}

export function requiredDefaultAssetPaths(): readonly string[] {
  return manifest.files;
}
