import { afterEach, describe, expect, it, vi } from 'vitest';
import { composeAtlas } from '../../src/core/atlas/composeAtlas';
import { resizePixelTexture } from '../../src/core/image/resizePixelTexture';
import {
  resolveSwitchAtlasMapping,
  switchTerrainMappings,
} from '../../src/core/mappings/switchMappings';
import {
  itemMappings,
  resolveAtlasMapping,
  terrainMappings,
} from '../../src/core/mappings/wiiuMappings';
import { createConversionReport } from '../../src/core/report/createConversionReport';

interface CanvasMock {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  clearRect: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  getContext: ReturnType<typeof vi.fn>;
}

function canvasMock(): CanvasMock {
  const clearRect = vi.fn();
  const drawImage = vi.fn();
  const context = {
    imageSmoothingEnabled: true,
    clearRect,
    drawImage,
  } as unknown as CanvasRenderingContext2D;
  const getContext = vi.fn(() => context);
  const canvas = {
    width: 0,
    height: 0,
    getContext,
    toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' }))),
  } as unknown as HTMLCanvasElement;
  return { canvas, context, clearRect, drawImage, getContext };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('browser image pipeline', () => {
  it('clears and replaces an item slot with smoothing disabled', async () => {
    const mock = canvasMock();
    vi.spyOn(document, 'createElement').mockReturnValue(mock.canvas);
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.resolve({ width: 16, height: 16, close: vi.fn() })),
    );
    const report = createConversionReport({
      name: 'pack',
      edition: 'java',
      files: [],
      textures: [],
    });

    await composeAtlas({
      base: new Blob(['base']),
      mapping: itemMappings,
      resolveMapping: resolveAtlasMapping,
      textures: [
        {
          sourcePath: 'assets/minecraft/textures/item/diamond_sword.png',
          canonicalId: 'diamond_sword',
          category: 'item',
          blob: new Blob(['item']),
        },
      ],
      targetSlotSize: 16,
      destination: 'Common/res/TitleUpdate/res/items.png',
      report,
      processed: new Set(),
    });

    expect(mock.context.imageSmoothingEnabled).toBe(false);
    expect(mock.getContext).toHaveBeenCalledWith('2d', { alpha: true });
    expect(mock.drawImage).toHaveBeenNthCalledWith(1, expect.anything(), 0, 0, 256, 272);
    expect(mock.drawImage).toHaveBeenLastCalledWith(
      expect.anything(),
      0,
      0,
      16,
      16,
      48,
      64,
      16,
      16,
    );
    expect(mock.clearRect).toHaveBeenCalledWith(48, 64, 16, 16);
    expect(mock.clearRect.mock.invocationCallOrder[0]).toBeLessThan(
      mock.drawImage.mock.invocationCallOrder[1],
    );
    expect(report.converted).toBe(1);
  });

  it('performs a 64 to 32 nearest-neighbor resize', async () => {
    const mock = canvasMock();
    vi.spyOn(document, 'createElement').mockReturnValue(mock.canvas);
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.resolve({ width: 64, height: 64, close: vi.fn() })),
    );

    await resizePixelTexture(new Blob(['source']), 32, 32);
    expect(mock.canvas.width).toBe(32);
    expect(mock.canvas.height).toBe(32);
    expect(mock.context.imageSmoothingEnabled).toBe(false);
    expect(mock.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 64, 64, 0, 0, 32, 32);
  });

  it('preserves and scales the default item atlas for 64px items', async () => {
    const mock = canvasMock();
    vi.spyOn(document, 'createElement').mockReturnValue(mock.canvas);
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.resolve({ width: 256, height: 272, close: vi.fn() })),
    );
    const report = createConversionReport({
      name: 'pack',
      edition: 'java',
      files: [],
      textures: [],
    });

    await composeAtlas({
      base: new Blob(['default-items']),
      mapping: itemMappings,
      resolveMapping: resolveAtlasMapping,
      textures: [],
      targetSlotSize: 64,
      destination: 'Common/res/TitleUpdate/res/items.png',
      report,
      processed: new Set(),
    });

    expect(mock.canvas.width).toBe(1024);
    expect(mock.canvas.height).toBe(1088);
    expect(mock.context.imageSmoothingEnabled).toBe(false);
    expect(mock.drawImage).toHaveBeenCalledTimes(1);
    expect(mock.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1024, 1088);
  });

  it('preserves and scales the default terrain atlas for 32px blocks', async () => {
    const mock = canvasMock();
    vi.spyOn(document, 'createElement').mockReturnValue(mock.canvas);
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.resolve({ width: 256, height: 544, close: vi.fn() })),
    );
    const report = createConversionReport({
      name: 'pack',
      edition: 'java',
      files: [],
      textures: [],
    });

    await composeAtlas({
      base: new Blob(['default-terrain']),
      mapping: terrainMappings,
      resolveMapping: resolveAtlasMapping,
      textures: [],
      targetSlotSize: 32,
      destination: 'Common/res/TitleUpdate/res/terrain.png',
      report,
      processed: new Set(),
    });

    expect(mock.canvas.width).toBe(512);
    expect(mock.canvas.height).toBe(1088);
    expect(mock.context.imageSmoothingEnabled).toBe(false);
    expect(mock.drawImage).toHaveBeenCalledTimes(1);
    expect(mock.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 512, 1088);
  });

  it('places and resizes a Switch terrain slot on an alpha canvas', async () => {
    const mock = canvasMock();
    vi.spyOn(document, 'createElement').mockReturnValue(mock.canvas);
    const bitmap = vi
      .fn()
      .mockResolvedValueOnce({ width: 256, height: 512, close: vi.fn() })
      .mockResolvedValueOnce({ width: 64, height: 64, close: vi.fn() });
    vi.stubGlobal('createImageBitmap', bitmap);
    const report = createConversionReport(
      { name: 'switch-pack', edition: 'java', files: [], textures: [] },
      'switch',
    );

    await composeAtlas({
      base: new Blob(['switch-terrain']),
      mapping: switchTerrainMappings,
      textures: [
        {
          sourcePath: 'assets/minecraft/textures/block/stone.png',
          canonicalId: 'stone',
          category: 'terrain',
          blob: new Blob(['64px-stone']),
        },
      ],
      targetSlotSize: 32,
      destination: 'Common/res/TitleUpdate/res/terrain.png',
      report,
      processed: new Set(),
      resolveMapping: resolveSwitchAtlasMapping,
    });

    expect(mock.canvas).toMatchObject({ width: 512, height: 1024 });
    expect(mock.getContext).toHaveBeenCalledWith('2d', { alpha: true });
    expect(mock.context.imageSmoothingEnabled).toBe(false);
    expect(mock.clearRect).toHaveBeenCalledWith(32, 0, 32, 32);
    expect(mock.drawImage).toHaveBeenLastCalledWith(expect.anything(), 0, 0, 64, 64, 32, 0, 32, 32);
    expect(report.entries).toContainEqual(
      expect.objectContaining({ canonicalId: 'stone', status: 'resized' }),
    );
  });
});
