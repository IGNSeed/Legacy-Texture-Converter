import type { ParsedPack, ParsedTexture, SourceEdition } from '../../types/conversion';

export type GuiTextureDestination = 'icons' | 'widgets';

export interface GuiTextureSelection {
  destination: GuiTextureDestination;
  selected?: ParsedTexture;
  rejected: ParsedTexture[];
}

function normalizedPath(path: string): string {
  return path.toLowerCase().replaceAll('\\', '/').replace(/^\/+/, '');
}

function hasSuffix(path: string, suffix: string): boolean {
  return path === suffix || path.endsWith(`/${suffix}`);
}

function isPackRootFile(path: string, name: string): boolean {
  const parts = path.split('/');
  return parts.at(-1) === name && parts.length <= 2;
}

function javaPriority(path: string, destination: GuiTextureDestination): number | undefined {
  if (destination === 'icons') {
    if (hasSuffix(path, 'assets/minecraft/textures/gui/icons.png')) return 0;
    if (hasSuffix(path, 'textures/gui/icons.png')) return 10;
    if (hasSuffix(path, 'gui/icons.png')) return 20;
    if (isPackRootFile(path, 'icons.png')) return 90;
    return undefined;
  }

  // Modern Java uses widgets.png. Legacy texture packs used gui/gui.png for
  // the same widget sheet, so that path is preferred over unscoped files.
  if (hasSuffix(path, 'assets/minecraft/textures/gui/widgets.png')) return 0;
  if (hasSuffix(path, 'textures/gui/widgets.png')) return 10;
  if (hasSuffix(path, 'gui/widgets.png')) return 20;
  if (hasSuffix(path, 'assets/minecraft/textures/gui/gui.png')) return 50;
  if (hasSuffix(path, 'textures/gui/gui.png')) return 60;
  if (hasSuffix(path, 'gui/gui.png')) return 30;
  if (isPackRootFile(path, 'widgets.png')) return 90;
  if (isPackRootFile(path, 'gui.png')) return 100;
  return undefined;
}

function bedrockPriority(path: string, destination: GuiTextureDestination): number | undefined {
  if (destination === 'icons') {
    if (hasSuffix(path, 'textures/gui/icons.png')) return 0;
    if (hasSuffix(path, 'gui/icons.png')) return 20;
    if (isPackRootFile(path, 'icons.png')) return 90;
    return undefined;
  }

  // Bedrock's verified GUI sheet is textures/gui/gui.png. widgets.png is
  // accepted as a Java-style compatibility fallback, not as the primary name.
  if (hasSuffix(path, 'textures/gui/gui.png')) return 0;
  if (hasSuffix(path, 'gui/gui.png')) return 20;
  if (hasSuffix(path, 'textures/gui/widgets.png')) return 30;
  if (hasSuffix(path, 'gui/widgets.png')) return 40;
  if (isPackRootFile(path, 'gui.png')) return 90;
  if (isPackRootFile(path, 'widgets.png')) return 100;
  return undefined;
}

export function guiTexturePriority(
  edition: Exclude<SourceEdition, 'unknown'>,
  path: string,
  destination: GuiTextureDestination,
): number | undefined {
  const normalized = normalizedPath(path);
  return edition === 'java'
    ? javaPriority(normalized, destination)
    : bedrockPriority(normalized, destination);
}

export function isGuiTexturePath(
  edition: Exclude<SourceEdition, 'unknown'>,
  path: string,
): boolean {
  return (
    guiTexturePriority(edition, path, 'icons') !== undefined ||
    guiTexturePriority(edition, path, 'widgets') !== undefined
  );
}

function candidatesFor(pack: ParsedPack, destination: GuiTextureDestination): ParsedTexture[] {
  return pack.textures
    .filter(
      (texture) =>
        texture.category === 'gui' &&
        guiTexturePriority(pack.edition, texture.sourcePath, destination) !== undefined,
    )
    .sort((left, right) => {
      const leftPriority = guiTexturePriority(pack.edition, left.sourcePath, destination) ?? 0;
      const rightPriority = guiTexturePriority(pack.edition, right.sourcePath, destination) ?? 0;
      return (
        leftPriority - rightPriority ||
        normalizedPath(left.sourcePath).localeCompare(normalizedPath(right.sourcePath)) ||
        left.sourcePath.localeCompare(right.sourcePath)
      );
    });
}

export function selectGuiTextures(pack: ParsedPack): GuiTextureSelection[] {
  return (['icons', 'widgets'] as const).map((destination) => {
    const candidates = candidatesFor(pack, destination);
    return {
      destination,
      selected: candidates[0],
      rejected: candidates.slice(1),
    };
  });
}

export function selectGuiTexture(
  pack: ParsedPack,
  destination: GuiTextureDestination,
): ParsedTexture | undefined {
  return selectGuiTextures(pack).find((selection) => selection.destination === destination)
    ?.selected;
}
