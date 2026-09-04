import type {
  ConversionResult,
  ParsedPack,
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
  mappings: EditionMappings;
  loadBaseline(): Promise<TargetEditionBaselineResult>;
  convert(
    pack: ParsedPack,
    baseline: ConsoleBaseAssetSet,
    onProgress?: ProgressCallback,
  ): Promise<ConversionResult>;
}
