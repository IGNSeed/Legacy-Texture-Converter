import type {
  ConversionOptions,
  ConversionResult,
  ParsedPack,
  ProgressCallback,
  Ps3Version,
} from '../../../types/conversion';
import { createPs3DownloadName } from '../../files/sanitizeFileName';
import { ps3Mappings } from '../../mappings/ps3Mappings';
import { buildWiiUFileTree } from '../../packaging/buildWiiUFileTree';
import { convertConsolePack } from '../common/convertConsolePack';
import type { Ps3BaseAssetSet } from './base-assets';
import { PS3_PATHS, ps3SpecialMipmapPath } from './paths';

export function convertPs3Pack(
  pack: ParsedPack,
  baseline: Ps3BaseAssetSet,
  version: Ps3Version,
  options?: ConversionOptions,
  onProgress?: ProgressCallback,
): Promise<ConversionResult> {
  if (baseline.ps3Version !== version) throw new Error('baseline-version-mismatch');
  return convertConsolePack(
    pack,
    baseline,
    {
      target: 'ps3',
      ps3Version: version,
      mappings: ps3Mappings(version),
      paths: {
        items: PS3_PATHS.items,
        terrain: PS3_PATHS.terrain,
        terrainMipmaps: PS3_PATHS.terrainMipmaps,
        particles: PS3_PATHS.particles,
        guiIcons: PS3_PATHS.guiIcons,
        guiWidgets: PS3_PATHS.guiWidgets,
        sky: PS3_PATHS.sky,
      },
      createDownloadName: (name) => createPs3DownloadName(name, version),
      buildFileTree: buildWiiUFileTree,
      specialMipmapPath: ps3SpecialMipmapPath,
      preserveUnmodifiedMedia: true,
    },
    options,
    onProgress,
  );
}
