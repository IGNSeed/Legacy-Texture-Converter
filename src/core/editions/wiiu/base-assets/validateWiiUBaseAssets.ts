import type { OutputFile } from '../../../../types/conversion';
import { validateBaseAssets } from '../../common/baseAssets';
import { EXPECTED_WIIU_BASE_DIMENSIONS, baseAssetGroup, WIIU_BASE_ASSET_PATHS } from './manifest';
import type { WiiUBaseAssetValidation } from './types';

export async function validateWiiUBaseAssets(
  files: readonly OutputFile[],
): Promise<WiiUBaseAssetValidation> {
  return validateBaseAssets(files, {
    paths: WIIU_BASE_ASSET_PATHS,
    expectedDimensions: EXPECTED_WIIU_BASE_DIMENSIONS,
    groupForPath: baseAssetGroup,
  });
}
