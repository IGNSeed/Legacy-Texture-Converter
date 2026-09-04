import { readWiiUBaseline } from '../../../files/readWiiUBaseline';
import { createWiiUBaseAssetSet } from './createWiiUBaseAssetSet';
import { mergeWiiUBaseAndUpdate } from './mergeWiiUBaseAndUpdate';
import type { WiiUBaseAssetLoadResult, WiiUBaseAssetProvider } from './types';

export class UserProvidedWiiUBaseAssetProvider implements WiiUBaseAssetProvider {
  readonly id = 'user-supplied';

  constructor(private readonly inputFiles: readonly File[]) {}

  async load(): Promise<WiiUBaseAssetLoadResult> {
    const input = await readWiiUBaseline(this.inputFiles);
    const merged = mergeWiiUBaseAndUpdate(input.files);
    return createWiiUBaseAssetSet(input.name, merged);
  }
}
