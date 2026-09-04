import type { OutputFile } from '../../../../types/conversion';
import { validateBaseAssets } from '../../common/baseAssets';
import {
  EXPECTED_SWITCH_BASE_DIMENSIONS,
  SWITCH_BASE_ASSET_PATHS,
  switchBaseAssetGroup,
} from './manifest';
import type { SwitchBaseAssetValidation } from './types';

export function validateSwitchBaseAssets(
  files: readonly OutputFile[],
): Promise<SwitchBaseAssetValidation> {
  return validateBaseAssets(files, {
    paths: SWITCH_BASE_ASSET_PATHS,
    expectedDimensions: EXPECTED_SWITCH_BASE_DIMENSIONS,
    groupForPath: switchBaseAssetGroup,
  });
}
