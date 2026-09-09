import latestManifestJson from '../../../../../data/mappings/ps3/latest/default-assets.json';
import oldManifestJson from '../../../../../data/mappings/ps3/1.8/default-assets.json';
import type { Ps3Version } from '../../../../types/conversion';
import type { BaseAssetGroup } from '../../common/baseAssets';
import { PS3_PATHS } from '../paths';

const manifests = {
  latest: latestManifestJson as { files: string[] },
  '1.8': oldManifestJson as { files: string[] },
};

export function ps3BaseAssetPaths(version: Ps3Version): readonly string[] {
  return manifests[version].files;
}

const terrainPaths = new Set<string>([
  PS3_PATHS.terrain,
  PS3_PATHS.terrainMip2,
  PS3_PATHS.terrainMip3,
]);

export function ps3BaseAssetGroup(path: string): BaseAssetGroup {
  if (path === PS3_PATHS.items) return 'items';
  if (terrainPaths.has(path)) return 'terrain';
  if (path === PS3_PATHS.particles) return 'particles';
  if (path.includes('/armor/')) return 'armor';
  return 'specialTextures';
}

export function expectedPs3BaseDimensions(
  version: Ps3Version,
): Readonly<Partial<Record<string, { width: number; height: number }>>> {
  const latest = version === 'latest';
  const armorDimensions = Object.fromEntries(
    ps3BaseAssetPaths(version)
      .filter((path) => path.includes('/armor/'))
      .map((path) => [path, { width: 64, height: 32 }]),
  );
  return {
    ...armorDimensions,
    [PS3_PATHS.items]: { width: 256, height: latest ? 272 : 256 },
    [PS3_PATHS.terrain]: { width: 256, height: latest ? 544 : 512 },
    [PS3_PATHS.terrainMip2]: { width: 128, height: latest ? 272 : 256 },
    [PS3_PATHS.terrainMip3]: { width: 64, height: latest ? 136 : 128 },
    [PS3_PATHS.particles]: { width: 128, height: 128 },
    [PS3_PATHS.guiIcons]: { width: 256, height: 256 },
    [PS3_PATHS.guiWidgets]: { width: 256, height: 256 },
    'Common/res/TitleUpdate/res/misc/glint.png': { width: 64, height: 64 },
  };
}
