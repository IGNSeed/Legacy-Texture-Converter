import type { VirtualFile } from '../../../../types/conversion';
import type {
  BaseAssetGroup,
  BaseAssetGroupValidation,
  BaseAssetIssue,
  BaseAssetValidation,
  ConsoleBaseAssetSet,
} from '../../common/baseAssets';

export type WiiUBaseAssetGroup = BaseAssetGroup;
export type WiiUBaseAssetIssue = BaseAssetIssue;
export type WiiUBaseAssetGroupValidation = BaseAssetGroupValidation;
export type WiiUBaseAssetValidation = BaseAssetValidation;
export type WiiUBaseAssetSet = ConsoleBaseAssetSet<'wiiu'>;

export interface WiiUBaseAssetLoadResult {
  assetSet?: WiiUBaseAssetSet;
  validation: WiiUBaseAssetValidation;
}

export interface WiiUBaseAssetProvider {
  readonly id: string;
  load(): Promise<WiiUBaseAssetLoadResult>;
}

export interface WiiUBaseAssetInput {
  name: string;
  files: VirtualFile[];
}
