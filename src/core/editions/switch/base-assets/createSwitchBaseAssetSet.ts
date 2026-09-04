import type { OutputFile } from '../../../../types/conversion';
import { SWITCH_PATHS } from '../paths';
import { switchBaseAssetGroup } from './manifest';
import type { SwitchBaseAssetLoadResult, SwitchBaseAssetSet } from './types';
import { validateSwitchBaseAssets } from './validateSwitchBaseAssets';

export async function createSwitchBaseAssetSet(
  name: string,
  files: readonly OutputFile[],
  provider: SwitchBaseAssetSet['provider'] = 'user-supplied',
): Promise<SwitchBaseAssetLoadResult> {
  const validation = await validateSwitchBaseAssets(files);
  if (!validation.valid) return { validation };

  const byPath = new Map(files.map((file) => [file.path, file.blob]));
  const items = byPath.get(SWITCH_PATHS.items);
  const terrain = byPath.get(SWITCH_PATHS.terrain);
  const particles = byPath.get(SWITCH_PATHS.particles);
  if (!items || !terrain || !particles) return { validation };

  return {
    validation,
    assetSet: {
      target: 'switch',
      provider,
      name,
      files: [...files],
      byPath,
      atlases: { items, terrain, particles },
      armor: new Map(
        files
          .filter((file) => switchBaseAssetGroup(file.path) === 'armor')
          .map((file) => [file.path, file.blob]),
      ),
      specialTextures: new Map(
        files
          .filter((file) => switchBaseAssetGroup(file.path) === 'specialTextures')
          .map((file) => [file.path, file.blob]),
      ),
      validation,
    },
  };
}
