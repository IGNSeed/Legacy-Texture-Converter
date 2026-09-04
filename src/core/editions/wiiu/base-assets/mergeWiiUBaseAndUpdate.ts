import type { OutputFile, VirtualFile } from '../../../../types/conversion';
import { normalizeArchivePath } from '../../../files/normalizeArchivePath';
import { WIIU_BASE_ASSET_PATHS } from './manifest';

type WiiUAssetSource = 'base' | 'unknown' | 'update';

const canonicalPaths = new Map(WIIU_BASE_ASSET_PATHS.map((path) => [path.toLowerCase(), path]));

function sourceKind(path: string): WiiUAssetSource {
  const segments = path
    .toLowerCase()
    .split('/')
    .map((segment) => segment.replace(/\.(zip|mcpack)$/, ''));
  if (segments.some((segment) => segment === 'upd' || /(^|[\s_(])upd([-\s_)]|$)/.test(segment))) {
    return 'update';
  }
  if (segments.some((segment) => segment === 'base' || /(^|[\s_(])base([-\s_)]|$)/.test(segment))) {
    return 'base';
  }
  return 'unknown';
}

function sourcePriority(source: WiiUAssetSource): number {
  if (source === 'update') return 2;
  if (source === 'base') return 0;
  return 1;
}

function destinationPath(path: string): string | undefined {
  const normalized = normalizeArchivePath(path);
  const lower = normalized.toLowerCase();
  const commonIndex = lower.indexOf('common/res/');
  if (commonIndex < 0) return undefined;
  return canonicalPaths.get(lower.slice(commonIndex));
}

export function mergeWiiUBaseAndUpdate(files: readonly VirtualFile[]): OutputFile[] {
  const resolved = new Map<string, { blob: Blob; priority: number }>();

  for (const file of files) {
    const path = destinationPath(file.path);
    if (!path) continue;
    const priority = sourcePriority(sourceKind(normalizeArchivePath(file.path)));
    const existing = resolved.get(path);
    if (!existing || priority >= existing.priority)
      resolved.set(path, { blob: file.blob, priority });
  }

  return [...resolved].map(([path, entry]) => ({ path, blob: entry.blob }));
}
