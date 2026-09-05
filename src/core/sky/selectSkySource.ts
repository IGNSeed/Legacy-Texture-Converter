import type { ParsedPack, ParsedTexture } from '../../types/conversion';

export const BEDROCK_CUBEMAP_LAYOUT = [
  [5, 4, 2],
  [3, 0, 1],
] as const;

export interface JavaSkyCandidate {
  texture: ParsedTexture;
  priority: number;
}

export type BedrockCubemapIssue = 'missing' | 'unexpected' | 'duplicate';

export interface BedrockCubemapCandidate {
  directory: string;
  displayPath: string;
  priority: number;
  textures: ParsedTexture[];
  faces?: readonly [
    ParsedTexture,
    ParsedTexture,
    ParsedTexture,
    ParsedTexture,
    ParsedTexture,
    ParsedTexture,
  ];
  issue?: BedrockCubemapIssue;
  missing: number[];
  unexpected: number[];
}

function normalizedPath(path: string): string {
  return path
    .toLowerCase()
    .replaceAll('\\', '/')
    .replace(/^\/+|\/+$/g, '');
}

function packRootFile(path: string, name: string): boolean {
  const parts = path.split('/');
  return parts.at(-1) === name && parts.length <= 2;
}

export function javaSkyPriority(path: string): number | undefined {
  const normalized = normalizedPath(path);
  const optifine = normalized.match(
    /(?:^|\/)assets\/minecraft\/optifine\/sky\/world0\/sky(\d+)\.png$/,
  );
  if (optifine) return Math.min(Number.parseInt(optifine[1] ?? '0', 10), 99_999);

  const mcpatcher = normalized.match(
    /(?:^|\/)assets\/minecraft\/mcpatcher\/sky\/world0\/sky(\d+)\.png$/,
  );
  if (mcpatcher) {
    return 100_000 + Math.min(Number.parseInt(mcpatcher[1] ?? '0', 10), 99_999);
  }

  if (/(?:^|\/)assets\/minecraft\/textures\/environment\/sky\.png$/.test(normalized)) {
    return 200_000;
  }
  if (/(?:^|\/)textures\/environment\/sky\.png$/.test(normalized)) return 210_000;
  if (/(?:^|\/)environment\/sky\.png$/.test(normalized)) return 220_000;
  if (packRootFile(normalized, 'sky.png')) return 300_000;
  return undefined;
}

export function isJavaSkyTexturePath(path: string): boolean {
  return javaSkyPriority(path) !== undefined;
}

export function javaSkyCandidates(pack: ParsedPack): JavaSkyCandidate[] {
  return pack.textures
    .flatMap((texture) => {
      if (texture.category !== 'sky') return [];
      const priority = javaSkyPriority(texture.sourcePath);
      return priority === undefined ? [] : [{ texture, priority }];
    })
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        normalizedPath(left.texture.sourcePath).localeCompare(
          normalizedPath(right.texture.sourcePath),
        ) ||
        left.texture.sourcePath.localeCompare(right.texture.sourcePath),
    );
}

function cubemapMatch(path: string): { directory: string; index: number } | undefined {
  const normalized = normalizedPath(path);
  const match = normalized.match(/^(?:(.*)\/)?cubemap_(\d+)\.png$/);
  if (!match) return undefined;
  return {
    directory: match[1] ?? '',
    index: Number.parseInt(match[2] ?? '-1', 10),
  };
}

export function isBedrockCubemapTexturePath(path: string): boolean {
  return cubemapMatch(path) !== undefined;
}

function cubemapDirectoryPriority(directory: string): number | undefined {
  if (/(?:^|\/)(?:nether|the_?end|end)_cubemap$/.test(directory)) return undefined;

  const standard = 'textures/environment/overworld_cubemap';
  if (directory === standard) return 0;
  if (directory.endsWith(`/${standard}`)) {
    const prefix = directory.slice(0, -(standard.length + 1));
    const depth = prefix.split('/').filter(Boolean).length;
    return prefix.includes('subpacks/') ? 20 + depth : depth;
  }
  if (directory === 'overworld_cubemap' || directory.endsWith('/overworld_cubemap')) return 40;
  if (directory === 'textures/environment' || directory.endsWith('/textures/environment')) {
    return 60;
  }
  if (directory === '' || !directory.includes('/')) return 90;
  return 80;
}

export function bedrockCubemapCandidates(pack: ParsedPack): BedrockCubemapCandidate[] {
  const groups = new Map<
    string,
    { displayPath: string; byIndex: Map<number, ParsedTexture[]>; textures: ParsedTexture[] }
  >();
  const textures = pack.textures
    .filter((texture) => texture.category === 'sky')
    .sort((left, right) =>
      normalizedPath(left.sourcePath).localeCompare(normalizedPath(right.sourcePath)),
    );

  for (const texture of textures) {
    const match = cubemapMatch(texture.sourcePath);
    if (!match) continue;
    const priority = cubemapDirectoryPriority(match.directory);
    if (priority === undefined) continue;
    const group = groups.get(match.directory) ?? {
      displayPath: match.directory || '.',
      byIndex: new Map<number, ParsedTexture[]>(),
      textures: [],
    };
    const indexed = group.byIndex.get(match.index) ?? [];
    indexed.push(texture);
    group.byIndex.set(match.index, indexed);
    group.textures.push(texture);
    groups.set(match.directory, group);
  }

  return [...groups]
    .map(([directory, group]) => {
      const priority = cubemapDirectoryPriority(directory) ?? Number.MAX_SAFE_INTEGER;
      const missing = [0, 1, 2, 3, 4, 5].filter((index) => !group.byIndex.has(index));
      const unexpected = [...group.byIndex.keys()].filter((index) => index < 0 || index > 5);
      const duplicate = [...group.byIndex.values()].some((entries) => entries.length !== 1);
      const issue: BedrockCubemapIssue | undefined = duplicate
        ? 'duplicate'
        : unexpected.length > 0
          ? 'unexpected'
          : missing.length > 0
            ? 'missing'
            : undefined;
      const faces: BedrockCubemapCandidate['faces'] = issue
        ? undefined
        : [
            group.byIndex.get(0)![0],
            group.byIndex.get(1)![0],
            group.byIndex.get(2)![0],
            group.byIndex.get(3)![0],
            group.byIndex.get(4)![0],
            group.byIndex.get(5)![0],
          ];
      return {
        directory,
        displayPath: group.displayPath,
        priority,
        textures: group.textures,
        faces,
        issue,
        missing,
        unexpected,
      };
    })
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        left.directory.localeCompare(right.directory) ||
        left.displayPath.localeCompare(right.displayPath),
    );
}
