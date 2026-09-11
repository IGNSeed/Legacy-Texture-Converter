import type { ParsedPack, VirtualFile } from '../../types/conversion';

const SOURCE_NAMES = {
  java: 'pack.png',
  bedrock: 'pack_icon.png',
} as const;

function normalizedPath(path: string): string {
  return path.toLowerCase().replaceAll('\\', '/').replace(/^\/+/, '');
}

function isPackRootFile(path: string, name: string): boolean {
  const parts = normalizedPath(path).split('/');
  return parts.at(-1) === name && parts.length <= 2;
}

function compareCandidates(left: VirtualFile, right: VirtualFile): number {
  const leftPath = normalizedPath(left.path);
  const rightPath = normalizedPath(right.path);
  return (
    leftPath.split('/').length - rightPath.split('/').length ||
    leftPath.localeCompare(rightPath) ||
    left.path.localeCompare(right.path)
  );
}

export interface PackIconSelection {
  selected?: VirtualFile;
  rejected: VirtualFile[];
}

export function selectPackIcon(pack: ParsedPack): PackIconSelection {
  const sourceName = SOURCE_NAMES[pack.edition];
  const candidates = pack.files
    .filter((file) => isPackRootFile(file.path, sourceName))
    .sort(compareCandidates);
  return { selected: candidates[0], rejected: candidates.slice(1) };
}
