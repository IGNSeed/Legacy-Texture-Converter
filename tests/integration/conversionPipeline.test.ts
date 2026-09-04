import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWiiUBaseAssetSet } from '../../src/core/editions/wiiu/base-assets';
import { convertWiiUPack } from '../../src/core/editions/wiiu/convertWiiUPack';
import type { ParsedTexture } from '../../src/types/conversion';
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
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn((blob: Blob) =>
        Promise.resolve({
          ...(sizes.get(blob) ?? { width: 16, height: 16 }),
          close: vi.fn(),
        }),
      ),
    );
    const loadedBaseline = await createWiiUBaseAssetSet('test', completeWiiUBaseFiles());
    if (!loadedBaseline.assetSet) throw new Error('test baseline was not created');
    const result = await convertWiiUPack(
      {
        name: 'Example.zip',
        edition: 'java',
        files: [],
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
        ],
      },
      loadedBaseline.assetSet,
    );

    expect(result.downloadName).toBe('Example_WiiU.zip');
    expect(result.report.converted).toBe(5);
    expect(result.report.resized).toBe(1);
    expect(result.report.unsupported).toBe(1);
    const archive = await JSZip.loadAsync(result.zipBlob);
    const paths = Object.keys(archive.files);
    expect(paths).toContain('Common/res/TitleUpdate/res/items.png');
    expect(paths).toContain('Common/res/TitleUpdate/res/terrainMipMapLevel3.png');
    expect(paths).toContain('Common/res/1_2_2/armor/iron_1.png');
    expect(paths).toContain('Common/res/TitleUpdate/res/textures/blocks/fire_0.png');
    expect(paths.every((path) => !/^(BASE|UPD)\//.test(path))).toBe(true);
  });
});
