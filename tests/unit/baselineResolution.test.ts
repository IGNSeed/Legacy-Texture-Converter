import { describe, expect, it } from 'vitest';
import {
  createWiiUBaseAssetSet,
  mergeWiiUBaseAndUpdate,
  validateWiiUBaseAssets,
  WIIU_BASE_ASSET_PATHS,
} from '../../src/core/editions/wiiu/base-assets';
import { WIIU_PATHS } from '../../src/core/editions/wiiu/paths';
import type { VirtualFile } from '../../src/types/conversion';
import { pngBlob } from '../helpers/png';
import { completeWiiUBaseFiles } from '../helpers/wiiuBaseAssets';

const virtual = (path: string, blob: Blob): VirtualFile => ({
  path,
  name: path.split('/').at(-1)!,
  blob,
});

describe('Wii U BASE + UPD baseline', () => {
  it('strips dump roots and gives UPD priority over BASE', () => {
    const relative = WIIU_PATHS.items;
    const baseBlob = pngBlob(256, 272, 'base');
    const updateBlob = pngBlob(256, 272, 'update');
    const resolved = mergeWiiUBaseAndUpdate([
      virtual(`WiiU(UPD)/${relative}`, updateBlob),
      virtual(`WiiU(BASE)/${relative}`, baseBlob),
    ]);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]).toEqual({ path: relative, blob: updateBlob });
  });

  it('falls back in both directions when only BASE or UPD has a required path', () => {
    const items = pngBlob(256, 272, 'base-only');
    const terrain = pngBlob(256, 544, 'update-only');
    const resolved = mergeWiiUBaseAndUpdate([
      virtual(`BASE/${WIIU_PATHS.items}`, items),
      virtual(`UPD/${WIIU_PATHS.terrain}`, terrain),
    ]);
    expect(resolved).toContainEqual({ path: WIIU_PATHS.items, blob: items });
    expect(resolved).toContainEqual({ path: WIIU_PATHS.terrain, blob: terrain });
  });

  it('creates a typed asset set from a complete user-supplied baseline', async () => {
    const files = completeWiiUBaseFiles();
    const loaded = await createWiiUBaseAssetSet('BASE + UPD', files);
    expect(loaded.validation.valid).toBe(true);
    expect(loaded.assetSet?.provider).toBe('user-supplied');
    expect(loaded.assetSet?.atlases.items).toBe(
      files.find((file) => file.path === WIIU_PATHS.items)?.blob,
    );
    expect(loaded.assetSet?.armor.size).toBeGreaterThan(0);
    expect(loaded.assetSet?.specialTextures.size).toBeGreaterThan(0);
  });

  it('reports missing groups without creating an incomplete asset set', async () => {
    const validation = await validateWiiUBaseAssets([
      { path: WIIU_PATHS.items, blob: pngBlob(256, 272) },
    ]);
    expect(validation.valid).toBe(false);
    expect(validation.missing).toHaveLength(WIIU_BASE_ASSET_PATHS.length - 1);
    expect(validation.groups.items.ok).toBe(true);
    expect(validation.groups.terrain.ok).toBe(false);
  });

  it('rejects invalid PNG data and unexpected vanilla atlas dimensions', async () => {
    const files = completeWiiUBaseFiles();
    const items = files.find((file) => file.path === WIIU_PATHS.items)!;
    items.blob = new Blob(['not-png']);
    const terrain = files.find((file) => file.path === WIIU_PATHS.terrain)!;
    terrain.blob = pngBlob(512, 1088);

    const loaded = await createWiiUBaseAssetSet('invalid', files);
    expect(loaded.assetSet).toBeUndefined();
    expect(loaded.validation.invalid).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: WIIU_PATHS.items, reason: 'invalid-png' }),
        expect.objectContaining({
          path: WIIU_PATHS.terrain,
          reason: 'unexpected-dimensions',
        }),
      ]),
    );
  });
});
