import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWiiUBaseAssetSet } from '../../src/core/editions/wiiu/base-assets';
import { WIIU_PATHS } from '../../src/core/editions/wiiu/paths';
import { wiiuAdapter } from '../../src/core/editions/wiiu/wiiuAdapter';
import { isArmorPowerTexturePath } from '../../src/core/packaging/outputFilePolicy';
import type { ParsedTexture, VirtualFile } from '../../src/types/conversion';
import { completeWiiUBaseFiles } from '../helpers/wiiuBaseAssets';

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

describe('complete Wii U conversion pipeline', () => {
  it('converts supported files, reports unsupported files, and emits a safe Wii U ZIP', async () => {
    const sizes = new WeakMap<Blob, { width: number; height: number }>();
    const texture = (
      sourcePath: string,
      canonicalId: string,
      category: ParsedTexture['category'],
      width: number,
      height = width,
    ): ParsedTexture => {
      const blob = new Blob([canonicalId], { type: 'image/png' });
      sizes.set(blob, { width, height });
      return { sourcePath, canonicalId, category, blob };
    };

    vi.spyOn(document, 'createElement').mockImplementation(() => fakeCanvas());
    const bitmap = vi.fn((blob: Blob) =>
      Promise.resolve({
        ...(sizes.get(blob) ?? { width: 16, height: 16 }),
        close: vi.fn(),
      }),
    );
    vi.stubGlobal('createImageBitmap', bitmap);
    const baseInventory = new Blob(['base-inventory'], { type: 'image/png' });
    const expectedDescription = '  §aWii U テストパック\nby Seed  ';
    const baseFiles = [
      ...completeWiiUBaseFiles(),
      { path: WIIU_PATHS.guiInventory, blob: baseInventory },
      { path: WIIU_PATHS.description, blob: new Blob(['baseline-description']) },
    ];
    const loadedBaseline = await createWiiUBaseAssetSet('test', baseFiles);
    if (!loadedBaseline.assetSet) throw new Error('test baseline was not created');
    const inputInventory = texture(
      'assets/minecraft/textures/gui/container/inventory.png',
      'inventory',
      'gui',
      176,
      166,
    );
    const inputPackIcon: VirtualFile = {
      path: 'pack.png',
      name: 'pack.png',
      blob: new Blob(['java-pack-icon'], { type: 'image/png' }),
    };
    const inputWater = texture(
      'assets/minecraft/textures/block/water_still.png',
      'water_still',
      'special',
      16,
      512,
    );
    const inputWaterFlow = texture(
      'assets/minecraft/textures/block/flowing_water.png',
      'flowing_water',
      'special',
      32,
      1024,
    );
    const inputLava = texture(
      'assets/minecraft/textures/block/lava_still.png',
      'lava_still',
      'special',
      16,
      320,
    );
    const inputLavaFlow = texture(
      'assets/minecraft/textures/block/flowing_lava.png',
      'flowing_lava',
      'special',
      32,
      512,
    );
    const result = await wiiuAdapter.convert(
      {
        name: 'Example.zip',
        edition: 'java',
        description: expectedDescription,
        files: [inputPackIcon],
        textures: [
          texture('assets/minecraft/textures/item/diamond_sword.png', 'diamond_sword', 'item', 64),
          texture('assets/minecraft/textures/block/stone.png', 'stone', 'terrain', 64),
          texture('assets/minecraft/textures/item/future_item.png', 'future_item', 'item', 16),
          texture(
            'assets/minecraft/textures/models/armor/iron_layer_1.png',
            'iron_layer_1',
            'armor',
            64,
            32,
          ),
          texture(
            'assets/minecraft/textures/blocks/fire_layer_0.png',
            'fire_layer_0',
            'special',
            16,
            512,
          ),
          texture(
            'assets/minecraft/textures/particle/particles.png',
            'particles',
            'particles',
            128,
          ),
          inputInventory,
          inputWater,
          inputWaterFlow,
          inputLava,
          inputLavaFlow,
        ],
      },
      loadedBaseline.assetSet,
      { itemResolution: 32 },
    );

    expect(result.downloadName).toBe('Example_WiiU.zip');
    expect(result.report.converted).toBe(7);
    expect(result.report.itemResolution).toBe(32);
    expect(result.report.resized).toBe(2);
    expect(result.report.unsupported).toBe(1);
    expect(result.report.skipped).toBe(4);
    expect(
      result.report.entries.filter((entry) => entry.messageKey === 'messages.inputFluidIgnored'),
    ).toHaveLength(4);
    for (const fluid of [inputWater, inputWaterFlow, inputLava, inputLavaFlow]) {
      expect(bitmap.mock.calls.some(([blob]) => blob === fluid.blob)).toBe(false);
    }
    const baseWater = loadedBaseline.assetSet.byPath.get(
      'Common/res/TitleUpdate/res/textures/blocks/water.png',
    );
    const baseLava = loadedBaseline.assetSet.byPath.get(
      'Common/res/TitleUpdate/res/textures/blocks/lava.png',
    );
    expect(baseWater).toBeDefined();
    expect(baseLava).toBeDefined();
    expect(
      result.outputFiles.find(
        (file) => file.path === 'Common/res/TitleUpdate/res/textures/blocks/water.png',
      )?.blob,
    ).toBe(baseWater);
    expect(
      result.outputFiles.find(
        (file) => file.path === 'Common/res/TitleUpdate/res/textures/blocks/lava.png',
      )?.blob,
    ).toBe(baseLava);
    expect(result.outputFiles.find((file) => file.path === WIIU_PATHS.guiInventory)?.blob).toBe(
      inputInventory.blob,
    );
    expect(result.outputFiles.find((file) => file.path === WIIU_PATHS.guiPackIcon)?.blob).toBe(
      inputPackIcon.blob,
    );
    expect(bitmap.mock.calls.some(([blob]) => blob === inputPackIcon.blob)).toBe(false);
    expect(result.outputFiles.some((file) => isArmorPowerTexturePath(file.path))).toBe(false);
    const archive = await JSZip.loadAsync(result.zipBlob);
    const paths = Object.keys(archive.files);
    expect(paths).toContain('Common/res/TitleUpdate/res/items.png');
    expect(paths).toContain('Common/res/TitleUpdate/res/terrainMipMapLevel3.png');
    expect(paths).toContain('Common/res/1_2_2/armor/iron_1.png');
    expect(paths).toContain('Common/res/TitleUpdate/res/textures/blocks/fire_0.png');
    expect(paths).toContain(WIIU_PATHS.guiInventory);
    expect(paths).toContain(WIIU_PATHS.guiPackIcon);
    expect(
      Array.from((await archive.file(WIIU_PATHS.description)?.async('uint8array')) ?? []),
    ).toEqual(Array.from(new TextEncoder().encode(expectedDescription)));
    expect(await archive.file(WIIU_PATHS.guiInventory)?.async('uint8array')).toEqual(
      new Uint8Array(await inputInventory.blob.arrayBuffer()),
    );
    expect(await archive.file(WIIU_PATHS.guiPackIcon)?.async('uint8array')).toEqual(
      new Uint8Array(await inputPackIcon.blob.arrayBuffer()),
    );
    expect(
      await archive
        .file('Common/res/TitleUpdate/res/textures/blocks/water.png')
        ?.async('uint8array'),
    ).toEqual(new Uint8Array(await baseWater!.arrayBuffer()));
    expect(
      await archive
        .file('Common/res/TitleUpdate/res/textures/blocks/lava.png')
        ?.async('uint8array'),
    ).toEqual(new Uint8Array(await baseLava!.arrayBuffer()));
    expect(paths.some(isArmorPowerTexturePath)).toBe(false);
    expect(paths).not.toContain('Common/Media/MediaWiiU.arc');
    expect(paths.every((path) => !/^(BASE|UPD)\//.test(path))).toBe(true);
  });
});
