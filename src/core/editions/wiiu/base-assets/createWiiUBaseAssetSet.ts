import type { OutputFile } from '../../../../types/conversion';
import { WIIU_PATHS } from '../paths';
import { baseAssetGroup } from './manifest';
import type { WiiUBaseAssetLoadResult, WiiUBaseAssetSet } from './types';
import { validateWiiUBaseAssets } from './validateWiiUBaseAssets';

export async function createWiiUBaseAssetSet(
  name: string,
  files: readonly OutputFile[],
  provider: WiiUBaseAssetSet['provider'] = 'user-supplied',
): Promise<WiiUBaseAssetLoadResult> {
  const validation = await validateWiiUBaseAssets(files);
  if (!validation.valid) return { validation };

  const byPath = new Map(files.map((file) => [file.path, file.blob]));
  const items = byPath.get(WIIU_PATHS.items);
  const terrain = byPath.get(WIIU_PATHS.terrain);
  const particles = byPath.get(WIIU_PATHS.particles);
  if (!items || !terrain || !particles) return { validation };

  return {
    validation,
    assetSet: {
      target: 'wiiu',
      provider,
      name,
      files: [...files],
      byPath,
      atlases: { items, terrain, particles },
      armor: new Map(
        files
          .filter((file) => baseAssetGroup(file.path) === 'armor')
          .map((file) => [file.path, file.blob]),
      ),
      specialTextures: new Map(
        files
          .filter((file) => baseAssetGroup(file.path) === 'specialTextures')
          .map((file) => [file.path, file.blob]),
      ),
      validation,
    },
  };
}
