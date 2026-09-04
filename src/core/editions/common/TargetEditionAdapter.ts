import type {
  ConversionResult,
  ParsedPack,
  ProgressCallback,
  TargetEdition,
} from '../../../types/conversion';

export interface TargetEditionAdapter<TBaseAssets> {
  id: TargetEdition;
  convert(
    pack: ParsedPack,
    baseline: TBaseAssets,
    onProgress?: ProgressCallback,
  ): Promise<ConversionResult>;
}
