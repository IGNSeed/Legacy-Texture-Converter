import type {
  ConversionOptions,
  ConversionResult,
  ParsedPack,
  ProgressCallback,
} from '../../../types/conversion';
import { createWiiUDownloadName } from '../../files/sanitizeFileName';
import { wiiuMappings } from '../../mappings/wiiuMappings';
import { buildWiiUFileTree } from '../../packaging/buildWiiUFileTree';
import { convertConsolePack } from '../common/convertConsolePack';
import type { WiiUBaseAssetSet } from './base-assets';
import { specialMipmapPath, WIIU_PATHS } from './paths';

export function convertWiiUPack(
  pack: ParsedPack,
  baseline: WiiUBaseAssetSet,
  options?: ConversionOptions,
  onProgress?: ProgressCallback,
): Promise<ConversionResult> {
  return convertConsolePack(
    pack,
    baseline,
    {
      target: 'wiiu',
      mappings: wiiuMappings,
      paths: {
        description: WIIU_PATHS.description,
        items: WIIU_PATHS.items,
        terrain: WIIU_PATHS.terrain,
        terrainMipmaps: WIIU_PATHS.terrainMipmaps,
        particles: WIIU_PATHS.particles,
        guiIcons: WIIU_PATHS.guiIcons,
        guiWidgets: WIIU_PATHS.guiWidgets,
        guiInventory: WIIU_PATHS.guiInventory,
        guiPackIcon: WIIU_PATHS.guiPackIcon,
        sky: WIIU_PATHS.sky,
      },
      createDownloadName: createWiiUDownloadName,
      buildFileTree: buildWiiUFileTree,
      specialMipmapPath,
    },
    options,
    onProgress,
  );
}
