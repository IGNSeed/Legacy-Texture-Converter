import type { Ps3Version } from '../../../types/conversion';
import { ps3Mappings } from '../../mappings/ps3Mappings';
import type { TargetEditionAdapter } from '../common/TargetEditionAdapter';
import { BundledPs3BaseAssetProvider, type Ps3BaseAssetSet } from './base-assets';
import { convertPs3Pack } from './convertPs3Pack';

const providers = {
  latest: new BundledPs3BaseAssetProvider('latest'),
  '1.8': new BundledPs3BaseAssetProvider('1.8'),
};

export function ps3Adapter(version?: Ps3Version): TargetEditionAdapter {
  if (!version) throw new Error('ps3-version-required');
  return {
    id: 'ps3',
    ps3Version: version,
    mappings: ps3Mappings(version),
    loadBaseline: () => providers[version].load(),
    convert(pack, baseline, onProgress) {
      if (baseline.target !== 'ps3' || baseline.ps3Version !== version) {
        throw new Error('baseline-target-mismatch');
      }
      return convertPs3Pack(pack, baseline as Ps3BaseAssetSet, version, onProgress);
    },
  };
}
