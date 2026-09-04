import { switchMappings } from '../../mappings/switchMappings';
import type { TargetEditionAdapter } from '../common/TargetEditionAdapter';
import { BundledSwitchBaseAssetProvider } from './base-assets';
import type { SwitchBaseAssetSet } from './base-assets';
import { convertSwitchPack } from './convertSwitchPack';

const baselineProvider = new BundledSwitchBaseAssetProvider();

export const switchAdapter: TargetEditionAdapter = {
  id: 'switch',
  mappings: switchMappings,
  loadBaseline: () => baselineProvider.load(),
  convert(pack, baseline, onProgress) {
    if (baseline.target !== 'switch') throw new Error('baseline-target-mismatch');
    return convertSwitchPack(pack, baseline as SwitchBaseAssetSet, onProgress);
  },
};
