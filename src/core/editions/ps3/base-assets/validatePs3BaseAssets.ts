import type { OutputFile, Ps3Version } from '../../../../types/conversion';
import { validateHudBaselineMedia } from '../../../gui-hud/validation';
import { validateBaseAssets } from '../../common/baseAssets';
import { expectedPs3BaseDimensions, ps3BaseAssetGroup, ps3BaseAssetPaths } from './manifest';

export async function validatePs3BaseAssets(files: readonly OutputFile[], version: Ps3Version) {
  const validation = await validateBaseAssets(files, {
    paths: ps3BaseAssetPaths(version),
    expectedDimensions: expectedPs3BaseDimensions(version),
    groupForPath: ps3BaseAssetGroup,
  });
  return validateHudBaselineMedia(files, 'ps3', validation, version);
}
