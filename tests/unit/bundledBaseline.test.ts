import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BundledWiiUBaseAssetProvider,
  WIIU_BASE_ASSET_PATHS,
  bundledWiiUBaseAssetUrl,
} from '../../src/core/editions/wiiu/base-assets';
import { completeWiiUBaseFiles } from '../helpers/wiiuBaseAssets';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('published Wii U baseline', () => {
  it('uses the configured Pages base path', () => {
    expect(bundledWiiUBaseAssetUrl('/Legacy-Texture-Converter/')).toBe(
      '/Legacy-Texture-Converter/assets/wiiu/default/wiiu-base-assets.zip',
    );
  });

  it('downloads, validates, and exposes the bundled asset set', async () => {
    const archive = new JSZip();
    for (const file of completeWiiUBaseFiles()) archive.file(file.path, file.blob);
    const archiveBlob = await archive.generateAsync({ type: 'blob' });
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(archiveBlob),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const loaded = await new BundledWiiUBaseAssetProvider('/baseline.zip').load();

    expect(fetchMock).toHaveBeenCalledWith('/baseline.zip');
    expect(loaded.validation.valid).toBe(true);
    expect(loaded.assetSet?.provider).toBe('bundled');
    expect(loaded.assetSet?.files).toHaveLength(WIIU_BASE_ASSET_PATHS.length);
  });

  it('fails clearly when the published archive cannot be fetched', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, blob: vi.fn() })),
    );

    await expect(new BundledWiiUBaseAssetProvider('/missing.zip').load()).rejects.toThrow(
      'baseline-unavailable',
    );
  });
});
