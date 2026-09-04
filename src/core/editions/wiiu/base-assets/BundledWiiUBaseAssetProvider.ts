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

  constructor(private readonly assetUrl = BUNDLED_WIIU_BASE_ASSET_URL) {}

  async load(): Promise<WiiUBaseAssetLoadResult> {
    const response = await fetch(this.assetUrl);
    if (!response.ok) throw new Error('baseline-unavailable');

    const files = await readZipPack(await response.blob());
    return createWiiUBaseAssetSet('Published Wii U baseline', files, 'bundled');
  }
}
