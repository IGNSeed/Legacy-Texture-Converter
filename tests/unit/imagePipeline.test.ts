import { afterEach, describe, expect, it, vi } from 'vitest';
import { composeAtlas } from '../../src/core/atlas/composeAtlas';
import { resizePixelTexture } from '../../src/core/image/resizePixelTexture';
import { itemMappings } from '../../src/core/mappings/wiiuMappings';
import { createConversionReport } from '../../src/core/report/createConversionReport';

interface CanvasMock {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  drawImage: ReturnType<typeof vi.fn>;
  getContext: ReturnType<typeof vi.fn>;
}

function canvasMock(): CanvasMock {
  const drawImage = vi.fn();
  const context = {
    imageSmoothingEnabled: true,
    clearRect: vi.fn(),
    drawImage,
  } as unknown as CanvasRenderingContext2D;
  const getContext = vi.fn(() => context);
  const canvas = {
    width: 0,
    height: 0,
    getContext,
    toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' }))),
  } as unknown as HTMLCanvasElement;
  return { canvas, context, drawImage, getContext };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('browser image pipeline', () => {
  it('places an item in its verified atlas slot with smoothing disabled', async () => {
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
});
