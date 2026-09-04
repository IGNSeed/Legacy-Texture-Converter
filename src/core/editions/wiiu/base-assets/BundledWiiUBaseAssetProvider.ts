import { readZipPack } from '../../../files/readZipPack';
import { createWiiUBaseAssetSet } from './createWiiUBaseAssetSet';
import type { WiiUBaseAssetLoadResult, WiiUBaseAssetProvider } from './types';

export function bundledWiiUBaseAssetUrl(baseUrl: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}assets/wiiu/default/wiiu-base-assets.zip`;
}

export const BUNDLED_WIIU_BASE_ASSET_URL = bundledWiiUBaseAssetUrl(import.meta.env.BASE_URL);

export class BundledWiiUBaseAssetProvider implements WiiUBaseAssetProvider {
  readonly id = 'bundled';
  private pending?: Promise<WiiUBaseAssetLoadResult>;

  constructor(private readonly assetUrl = BUNDLED_WIIU_BASE_ASSET_URL) {}

  load(): Promise<WiiUBaseAssetLoadResult> {
    this.pending ??= this.loadArchive().catch((error: unknown) => {
      this.pending = undefined;
      throw error;
    });
    return this.pending;
  }

  private async loadArchive(): Promise<WiiUBaseAssetLoadResult> {
    const response = await fetch(this.assetUrl);
    if (!response.ok) throw new Error('baseline-unavailable');

    const files = await readZipPack(await response.blob());
    return createWiiUBaseAssetSet('Published Wii U baseline', files, 'bundled');
  }
}
