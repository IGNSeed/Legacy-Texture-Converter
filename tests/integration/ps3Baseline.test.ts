import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  bundledPs3BaseAssetUrl,
  createPs3BaseAssetSet,
  ps3BaseAssetPaths,
} from '../../src/core/editions/ps3/base-assets';
import { PS3_PATHS } from '../../src/core/editions/ps3/paths';
import { targetAdapterKey, targetEditionAdapter } from '../../src/core/editions/targetEditions';
import { createPs3DownloadName } from '../../src/core/files/sanitizeFileName';
import { readZipPack } from '../../src/core/files/readZipPack';
import { ps3LatestMappings, ps3OneEightMappings } from '../../src/core/mappings/ps3Mappings';

describe('bundled PlayStation 3 baselines', () => {
  it('uses versioned Pages URLs, PS3 Common paths, and versioned download names', () => {
    expect(bundledPs3BaseAssetUrl('/Legacy-Texture-Converter/', 'latest')).toBe(
      '/Legacy-Texture-Converter/assets/ps3/latest/ps3-latest-base-assets.zip',
    );
    expect(bundledPs3BaseAssetUrl('/Legacy-Texture-Converter/', '1.8')).toBe(
      '/Legacy-Texture-Converter/assets/ps3/1.8/ps3-1.8-base-assets.zip',
    );
    expect(
      Object.values(PS3_PATHS)
        .flat()
        .every((path) => path.startsWith('Common/')),
    ).toBe(true);
    expect(createPs3DownloadName('Pack.zip', 'latest')).toBe('Pack_PS3_Latest.zip');
    expect(createPs3DownloadName('Pack.zip', '1.8')).toBe('Pack_PS3_1.8.zip');
    expect(targetAdapterKey('ps3', 'latest')).toBe('ps3-latest');
    expect(targetAdapterKey('ps3', '1.8')).toBe('ps3-1.8');
    expect(() => targetEditionAdapter('ps3')).toThrow('ps3-version-required');
    expect(targetEditionAdapter('ps3', 'latest')).toMatchObject({
      id: 'ps3',
      ps3Version: 'latest',
      mappings: ps3LatestMappings,
    });
  });

  for (const version of ['latest', '1.8'] as const) {
    it(`validates every ${version} manifest asset and binary HUD`, async () => {
      const bytes = await readFile(`public/assets/ps3/${version}/ps3-${version}-base-assets.zip`);
      const files = await readZipPack(new Blob([bytes]));
      const loaded = await createPs3BaseAssetSet(`PS3 ${version}`, files, version, 'bundled');
      expect(loaded.validation.invalid).toEqual([]);
      expect(loaded.validation.missing).toEqual([]);
      expect(loaded.assetSet).toMatchObject({ target: 'ps3', ps3Version: version });
      expect(loaded.assetSet?.files).toHaveLength(ps3BaseAssetPaths(version).length);
    });
  }

  it('rejects a missing GUI asset and a damaged Media archive', async () => {
    const bytes = await readFile('public/assets/ps3/latest/ps3-latest-base-assets.zip');
    const files = await readZipPack(new Blob([bytes]));
    const missingGui = await createPs3BaseAssetSet(
      'missing GUI',
      files.filter((file) => file.path !== PS3_PATHS.guiIcons),
      'latest',
    );
    expect(missingGui.assetSet).toBeUndefined();
    expect(missingGui.validation.missing).toContain(PS3_PATHS.guiIcons);

    const damagedMedia = files.map((file) =>
      file.path === PS3_PATHS.media ? { ...file, blob: new Blob(['damaged']) } : file,
    );
    const invalid = await createPs3BaseAssetSet('damaged Media', damagedMedia, 'latest');
    expect(invalid.assetSet).toBeUndefined();
    expect(invalid.validation.invalid).toContainEqual(
      expect.objectContaining({ path: PS3_PATHS.media, reason: 'invalid-binary' }),
    );
  });

  it('keeps Latest and 1.8 atlas definitions separate', () => {
    expect(ps3LatestMappings.items.atlas).toEqual({ width: 256, height: 272, slotSize: 16 });
    expect(ps3OneEightMappings.items.atlas).toEqual({ width: 256, height: 256, slotSize: 16 });
    expect(ps3LatestMappings.terrain.atlas).toEqual({ width: 256, height: 544, slotSize: 16 });
    expect(ps3OneEightMappings.terrain.atlas).toEqual({ width: 256, height: 512, slotSize: 16 });
    expect(ps3OneEightMappings.items.entries.length).toBeLessThan(
      ps3LatestMappings.items.entries.length,
    );
    expect(ps3OneEightMappings.terrain.entries.length).toBeLessThan(
      ps3LatestMappings.terrain.entries.length,
    );
    expect(ps3LatestMappings.resolveAtlasMapping('item', 'acacia_boat')).toBeDefined();
    expect(ps3OneEightMappings.resolveAtlasMapping('item', 'acacia_boat')).toBeUndefined();
    expect(ps3LatestMappings.resolveAtlasMapping('particles', 'bubble')).toBeDefined();
    expect(ps3OneEightMappings.resolveAtlasMapping('particles', 'bubble')).toBeUndefined();
    expect(ps3LatestMappings.resolveArmorMapping('turtle_layer_1')).toBeDefined();
    expect(ps3OneEightMappings.resolveArmorMapping('turtle_layer_1')).toBeUndefined();
  });
});
