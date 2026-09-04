import type {
  BaseAssetGroup,
  BaseAssetGroupValidation,
  BaseAssetIssue,
  BaseAssetValidation,
  ConsoleBaseAssetSet,
} from '../../common/baseAssets';

export type SwitchBaseAssetGroup = BaseAssetGroup;
export type SwitchBaseAssetIssue = BaseAssetIssue;
export type SwitchBaseAssetGroupValidation = BaseAssetGroupValidation;
export type SwitchBaseAssetValidation = BaseAssetValidation;
export type SwitchBaseAssetSet = ConsoleBaseAssetSet<'switch'>;

export interface SwitchBaseAssetLoadResult {
  assetSet?: SwitchBaseAssetSet;
  validation: SwitchBaseAssetValidation;
}

export interface SwitchBaseAssetProvider {
  readonly id: string;
  load(): Promise<SwitchBaseAssetLoadResult>;
}
