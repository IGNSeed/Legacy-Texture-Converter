import type { OutputFile, Ps3Version } from '../../../../types/conversion';
import { PS3_PATHS } from '../paths';
import { ps3BaseAssetGroup } from './manifest';
import type { Ps3BaseAssetLoadResult, Ps3BaseAssetSet } from './types';
import { validatePs3BaseAssets } from './validatePs3BaseAssets';

export async function createPs3BaseAssetSet(
  name: string,
  files: readonly OutputFile[],
  version: Ps3Version,
  provider: Ps3BaseAssetSet['provider'] = 'user-supplied',
): Promise<Ps3BaseAssetLoadResult> {
  const validation = await validatePs3BaseAssets(files, version);
  if (!validation.valid) return { validation };
  const byPath = new Map(files.map((file) => [file.path, file.blob]));
  const items = byPath.get(PS3_PATHS.items);
  const terrain = byPath.get(PS3_PATHS.terrain);
  const particles = byPath.get(PS3_PATHS.particles);
  if (!items || !terrain || !particles) return { validation };

  return {
    validation,
    assetSet: {
      target: 'ps3',
      ps3Version: version,
      provider,
      name,
      files: [...files],
      byPath,
      atlases: { items, terrain, particles },
      armor: new Map(
        files
          .filter((file) => ps3BaseAssetGroup(file.path) === 'armor')
          .map((file) => [file.path, file.blob]),
      ),
      specialTextures: new Map(
        files
          .filter((file) => ps3BaseAssetGroup(file.path) === 'specialTextures')
          .map((file) => [file.path, file.blob]),
      ),
      validation,
    },
  };
}
