import type {
  ConversionOptions,
  ConversionResult,
  ParsedPack,
  ProgressCallback,
} from '../../../types/conversion';
import { createSwitchDownloadName } from '../../files/sanitizeFileName';
import { switchMappings } from '../../mappings/switchMappings';
import { buildSwitchFileTree } from '../../packaging/buildSwitchFileTree';
import { convertConsolePack } from '../common/convertConsolePack';
import type { SwitchBaseAssetSet } from './base-assets';
import { SWITCH_PATHS, switchSpecialMipmapPath } from './paths';

export function convertSwitchPack(
  pack: ParsedPack,
  baseline: SwitchBaseAssetSet,
  options?: ConversionOptions,
  onProgress?: ProgressCallback,
): Promise<ConversionResult> {
  return convertConsolePack(
    pack,
    baseline,
    {
      target: 'switch',
      mappings: switchMappings,
      paths: {
        items: SWITCH_PATHS.items,
        terrain: SWITCH_PATHS.terrain,
        terrainMipmaps: SWITCH_PATHS.terrainMipmaps,
        particles: SWITCH_PATHS.particles,
        guiIcons: SWITCH_PATHS.guiIcons,
        guiWidgets: SWITCH_PATHS.guiWidgets,
        sky: SWITCH_PATHS.sky,
      },
      createDownloadName: createSwitchDownloadName,
      buildFileTree: buildSwitchFileTree,
      specialMipmapPath: switchSpecialMipmapPath,
    },
    options,
    onProgress,
  );
}
