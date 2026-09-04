import { readZipPack } from '../../../files/readZipPack';
import { createSwitchBaseAssetSet } from './createSwitchBaseAssetSet';
import type { SwitchBaseAssetLoadResult, SwitchBaseAssetProvider } from './types';

export function bundledSwitchBaseAssetUrl(baseUrl: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}assets/switch/default/switch-base-assets.zip`;
}

export const BUNDLED_SWITCH_BASE_ASSET_URL = bundledSwitchBaseAssetUrl(import.meta.env.BASE_URL);

export class BundledSwitchBaseAssetProvider implements SwitchBaseAssetProvider {
  readonly id = 'bundled';
  private pending?: Promise<SwitchBaseAssetLoadResult>;

  constructor(private readonly assetUrl = BUNDLED_SWITCH_BASE_ASSET_URL) {}

  load(): Promise<SwitchBaseAssetLoadResult> {
    this.pending ??= this.loadArchive().catch((error: unknown) => {
      this.pending = undefined;
      throw error;
    });
    return this.pending;
  }

  private async loadArchive(): Promise<SwitchBaseAssetLoadResult> {
    const response = await fetch(this.assetUrl);
    if (!response.ok) throw new Error('switch-baseline-unavailable');

    const files = await readZipPack(await response.blob());
    return createSwitchBaseAssetSet(
      'Published Nintendo Switch Edition 1.0.17 baseline',
      files,
      'bundled',
    );
  }
}
