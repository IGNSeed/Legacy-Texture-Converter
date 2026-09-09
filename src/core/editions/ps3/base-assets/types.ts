import type { Ps3Version } from '../../../../types/conversion';
import type { BaseAssetValidation, ConsoleBaseAssetSet } from '../../common/baseAssets';

export type Ps3BaseAssetSet = ConsoleBaseAssetSet<'ps3'> & { ps3Version: Ps3Version };

export interface Ps3BaseAssetLoadResult {
  assetSet?: Ps3BaseAssetSet;
  validation: BaseAssetValidation;
}

export interface Ps3BaseAssetProvider {
  readonly id: string;
  load(): Promise<Ps3BaseAssetLoadResult>;
}
