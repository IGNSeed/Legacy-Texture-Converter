import type { ParsedPack, ParsedTexture } from '../../types/conversion';

export const JAVA_INVENTORY_TEXTURE_PATH = 'assets/minecraft/textures/gui/container/inventory.png';

function normalizedPath(path: string): string {
  return path.toLowerCase().replaceAll('\\', '/').replace(/^\/+/, '');
}

export function isJavaInventoryTexturePath(path: string): boolean {
  const normalized = normalizedPath(path);
  return (
    normalized === JAVA_INVENTORY_TEXTURE_PATH ||
    normalized.endsWith(`/${JAVA_INVENTORY_TEXTURE_PATH}`)
  );
}

function compareCandidates(left: ParsedTexture, right: ParsedTexture): number {
  const leftPath = normalizedPath(left.sourcePath);
  const rightPath = normalizedPath(right.sourcePath);
  const leftWrapped = leftPath === JAVA_INVENTORY_TEXTURE_PATH ? 0 : 1;
  const rightWrapped = rightPath === JAVA_INVENTORY_TEXTURE_PATH ? 0 : 1;
  return (
    leftWrapped - rightWrapped ||
    leftPath.split('/').length - rightPath.split('/').length ||
    leftPath.localeCompare(rightPath) ||
    left.sourcePath.localeCompare(right.sourcePath)
  );
}

export interface JavaInventoryTextureSelection {
  selected?: ParsedTexture;
  rejected: ParsedTexture[];
}

export function selectJavaInventoryTexture(pack: ParsedPack): JavaInventoryTextureSelection {
  if (pack.edition !== 'java') return { rejected: [] };
  const candidates = pack.textures
    .filter((texture) => isJavaInventoryTexturePath(texture.sourcePath))
    .sort(compareCandidates);
  return { selected: candidates[0], rejected: candidates.slice(1) };
}
