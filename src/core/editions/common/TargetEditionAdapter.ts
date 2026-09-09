import type {
  ConversionOptions,
  ConversionResult,
  ParsedPack,
  Ps3Version,
  ProgressCallback,
  TargetEdition,
} from '../../../types/conversion';
import type { EditionMappings } from '../../mappings/createEditionMappings';
import type { BaseAssetValidation, ConsoleBaseAssetSet } from './baseAssets';

export interface TargetEditionBaselineResult {
  assetSet?: ConsoleBaseAssetSet;
  validation: BaseAssetValidation;
}

export interface TargetEditionAdapter {
  id: TargetEdition;
  ps3Version?: Ps3Version;
  mappings: EditionMappings;
  loadBaseline(): Promise<TargetEditionBaselineResult>;
  convert(
    pack: ParsedPack,
    baseline: ConsoleBaseAssetSet,
    options?: ConversionOptions,
    onProgress?: ProgressCallback,
  ): Promise<ConversionResult>;
}
