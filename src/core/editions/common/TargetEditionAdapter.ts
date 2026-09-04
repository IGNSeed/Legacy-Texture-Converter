import type {
  ConversionResult,
  OutputFile,
  ParsedPack,
  ProgressCallback,
  TargetEdition,
} from '../../../types/conversion';

export interface TargetEditionAdapter {
  id: TargetEdition;
  convert(
    pack: ParsedPack,
    baseline: readonly OutputFile[],
    onProgress?: ProgressCallback,
  ): Promise<ConversionResult>;
}
