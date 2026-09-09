import type { Ps3Version } from '../../../../types/conversion';
import { readZipPack } from '../../../files/readZipPack';
import { createPs3BaseAssetSet } from './createPs3BaseAssetSet';
import type { Ps3BaseAssetLoadResult, Ps3BaseAssetProvider } from './types';

export function bundledPs3BaseAssetUrl(baseUrl: string, version: Ps3Version): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}assets/ps3/${version}/ps3-${version}-base-assets.zip`;
}

export class BundledPs3BaseAssetProvider implements Ps3BaseAssetProvider {
  readonly id = 'bundled';
  private pending?: Promise<Ps3BaseAssetLoadResult>;

  constructor(
    private readonly version: Ps3Version,
    private readonly assetUrl = bundledPs3BaseAssetUrl(import.meta.env.BASE_URL, version),
  ) {}

  load(): Promise<Ps3BaseAssetLoadResult> {
    this.pending ??= this.loadArchive().catch((error: unknown) => {
      this.pending = undefined;
      throw error;
    });
    return this.pending;
  }

  private async loadArchive(): Promise<Ps3BaseAssetLoadResult> {
    const response = await fetch(this.assetUrl);
    if (!response.ok) throw new Error('ps3-baseline-unavailable');
    const files = await readZipPack(await response.blob());
    return createPs3BaseAssetSet(
      `Published PlayStation 3 Edition ${this.version} baseline`,
      files,
      this.version,
      'bundled',
    );
  }
}
