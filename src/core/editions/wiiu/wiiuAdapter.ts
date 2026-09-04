import type { TargetEditionAdapter } from '../common/TargetEditionAdapter';
import { BundledWiiUBaseAssetProvider } from './base-assets';
import type { WiiUBaseAssetSet } from './base-assets';
import { wiiuMappings } from '../../mappings/wiiuMappings';
import { convertWiiUPack } from './convertWiiUPack';

const baselineProvider = new BundledWiiUBaseAssetProvider();

export const wiiuAdapter: TargetEditionAdapter = {
  id: 'wiiu',
  mappings: wiiuMappings,
  loadBaseline: () => baselineProvider.load(),
  convert(pack, baseline, onProgress) {
    if (baseline.target !== 'wiiu') throw new Error('baseline-target-mismatch');
    return convertWiiUPack(pack, baseline as WiiUBaseAssetSet, onProgress);
  },
};
