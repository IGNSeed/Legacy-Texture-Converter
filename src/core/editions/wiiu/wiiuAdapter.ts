import type { TargetEditionAdapter } from '../common/TargetEditionAdapter';
import type { WiiUBaseAssetSet } from './base-assets';
import { convertWiiUPack } from './convertWiiUPack';

export const wiiuAdapter: TargetEditionAdapter<WiiUBaseAssetSet> = {
  id: 'wiiu',
  convert: convertWiiUPack,
};
