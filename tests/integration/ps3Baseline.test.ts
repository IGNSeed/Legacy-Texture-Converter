import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bundledPs3BaseAssetUrl,
  createPs3BaseAssetSet,
  ps3BaseAssetPaths,
} from '../../src/core/editions/ps3/base-assets';
import { PS3_PATHS } from '../../src/core/editions/ps3/paths';
import { convertPs3Pack } from '../../src/core/editions/ps3/convertPs3Pack';
import { targetAdapterKey, targetEditionAdapter } from '../../src/core/editions/targetEditions';
import { createPs3DownloadName } from '../../src/core/files/sanitizeFileName';
import { readZipPack } from '../../src/core/files/readZipPack';
import { ps3LatestMappings, ps3OneEightMappings } from '../../src/core/mappings/ps3Mappings';
import type { ParsedTexture } from '../../src/types/conversion';

function fakeCanvas(): HTMLCanvasElement {
  const context = {
    imageSmoothingEnabled: true,
    clearRect: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' }))),
  } as unknown as HTMLCanvasElement;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

    it(`preserves ${version} vanilla fluids when Java fluid textures are supplied`, async () => {
      vi.spyOn(document, 'createElement').mockImplementation(() => fakeCanvas());
      const bytes = await readFile(`public/assets/ps3/${version}/ps3-${version}-base-assets.zip`);
      const files = await readZipPack(new Blob([bytes]));
      const loaded = await createPs3BaseAssetSet(`PS3 ${version}`, files, version, 'bundled');
      if (!loaded.assetSet) throw new Error('test PS3 baseline was not created');

      const fluid = (canonicalId: string): ParsedTexture => ({
        sourcePath: `assets/minecraft/textures/block/${canonicalId}.png`,
        canonicalId,
        category: 'special',
        blob: new Blob([`input-${canonicalId}`], { type: 'image/png' }),
        animationMetadata: JSON.stringify({ animation: { frametime: 1 } }),
      });
      const inputFluids = [
        fluid('water_still'),
        fluid('water_flow'),
        fluid('lava_still'),
        fluid('lava_flow'),
      ];
      const bitmap = vi.fn((blob: Blob) => {
        void blob;
        return Promise.resolve({ width: 16, height: 16, close: vi.fn() });
      });
      vi.stubGlobal('createImageBitmap', bitmap);

      const result = await convertPs3Pack(
        {
          name: `PS3-${version}.zip`,
          edition: 'java',
          files: [],
          textures: inputFluids,
        },
        loaded.assetSet,
        version,
      );

      expect(result.report.skipped).toBe(4);
      expect(
        result.report.entries.filter((entry) => entry.messageKey === 'messages.inputFluidIgnored'),
      ).toHaveLength(4);
      for (const texture of inputFluids) {
        expect(bitmap.mock.calls.some(([blob]) => blob === texture.blob)).toBe(false);
      }

      const vanillaWater = loaded.assetSet.byPath.get(
        'Common/res/TitleUpdate/res/textures/blocks/water.png',
      );
      const vanillaLava = loaded.assetSet.byPath.get(
        'Common/res/TitleUpdate/res/textures/blocks/lava.png',
      );
      expect(vanillaWater).toBeDefined();
      expect(vanillaLava).toBeDefined();
      expect(
        result.outputFiles.find(
          (file) => file.path === 'Common/res/TitleUpdate/res/textures/blocks/water.png',
        )?.blob,
      ).toBe(vanillaWater);
      expect(
        result.outputFiles.find(
          (file) => file.path === 'Common/res/TitleUpdate/res/textures/blocks/lava.png',
        )?.blob,
      ).toBe(vanillaLava);

      const archive = await JSZip.loadAsync(result.zipBlob);
      expect(
        await archive
          .file('Common/res/TitleUpdate/res/textures/blocks/water.png')
          ?.async('uint8array'),
      ).toEqual(new Uint8Array(await vanillaWater!.arrayBuffer()));
      expect(
        await archive
          .file('Common/res/TitleUpdate/res/textures/blocks/lava.png')
          ?.async('uint8array'),
      ).toEqual(new Uint8Array(await vanillaLava!.arrayBuffer()));
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
