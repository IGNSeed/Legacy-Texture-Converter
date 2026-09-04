import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BundledSwitchBaseAssetProvider,
  createSwitchBaseAssetSet,
  SWITCH_BASE_ASSET_PATHS,
  bundledSwitchBaseAssetUrl,
} from '../../src/core/editions/switch/base-assets';
import { SWITCH_PATHS } from '../../src/core/editions/switch/paths';
import { pngBlob } from '../helpers/png';
import { completeSwitchBaseFiles } from '../helpers/switchBaseAssets';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Nintendo Switch Edition 1.0.17 baseline', () => {
  it('uses the configured Pages base path', () => {
    expect(bundledSwitchBaseAssetUrl('/Legacy-Texture-Converter/')).toBe(
      '/Legacy-Texture-Converter/assets/switch/default/switch-base-assets.zip',
    );
  });

  it('validates exact Switch atlas dimensions', async () => {
    const files = completeSwitchBaseFiles();
    const loaded = await createSwitchBaseAssetSet('Switch 1.0.17', files);
    expect(loaded.validation.valid).toBe(true);
    expect(loaded.assetSet?.target).toBe('switch');
    expect(loaded.assetSet?.files).toHaveLength(SWITCH_BASE_ASSET_PATHS.length);

    files.find((file) => file.path === SWITCH_PATHS.terrain)!.blob = pngBlob(256, 544);
    const invalid = await createSwitchBaseAssetSet('wrong terrain', files);
    expect(invalid.assetSet).toBeUndefined();
    expect(invalid.validation.invalid).toContainEqual(
      expect.objectContaining({
        path: SWITCH_PATHS.terrain,
        reason: 'unexpected-dimensions',
      }),
    );
  });

  it('downloads and expands its archive only once per provider', async () => {
    const archive = new JSZip();
    for (const file of completeSwitchBaseFiles()) archive.file(file.path, file.blob);
    const archiveBlob = await archive.generateAsync({ type: 'blob' });
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, blob: () => Promise.resolve(archiveBlob) }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const provider = new BundledSwitchBaseAssetProvider('/switch-baseline.zip');

    const [first, second] = await Promise.all([provider.load(), provider.load()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first.assetSet).toBe(second.assetSet);
    expect(first.validation.valid).toBe(true);
  });
});
