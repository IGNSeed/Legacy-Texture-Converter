import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLceAnimationText } from '../../src/core/convert/animationMetadata';
import { generateMipmaps, mipmapDimensions } from '../../src/core/mipmap/generateMipmaps';
import { WIIU_PATHS, specialMipmapPath } from '../../src/core/editions/wiiu/paths';
import { SWITCH_PATHS } from '../../src/core/editions/switch/paths';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('derived Wii U files', () => {
  it('derives terrain mipmap dimensions from the final terrain', () => {
    expect(mipmapDimensions(256, 544, 1)).toEqual({ width: 128, height: 272 });
    expect(mipmapDimensions(256, 544, 2)).toEqual({ width: 64, height: 136 });
    expect(WIIU_PATHS.terrainMip3).toBe('Common/res/TitleUpdate/res/terrainMipMapLevel3.png');
  });

  it('creates special-texture mipmap paths without BASE or UPD prefixes', () => {
    expect(specialMipmapPath('Common/res/TitleUpdate/res/textures/blocks/fire_0.png', 1)).toMatch(
      /fire_0MipMapLevel2\.png$/,
    );
  });

  it('translates Java animation frame order and timing', () => {
    const metadata = JSON.stringify({
      animation: { frametime: 2, frames: [1, { index: 0, time: 4 }] },
    });
    expect(createLceAnimationText(metadata, 2)).toBe('1*2\n0*4\n');
  });
});

describe('derived Switch files', () => {
  it('derives the two terrain mipmaps from the 256x512 final atlas', () => {
    expect(mipmapDimensions(256, 512, 1)).toEqual({ width: 128, height: 256 });
    expect(mipmapDimensions(256, 512, 2)).toEqual({ width: 64, height: 128 });
    expect(SWITCH_PATHS.terrainMipmaps).toEqual([
      'Common/res/TitleUpdate/res/terrainMipMapLevel2.png',
      'Common/res/TitleUpdate/res/terrainMipMapLevel3.png',
    ]);
  });

  it('supports minimum frame-strip dimensions for special textures', () => {
    expect(mipmapDimensions(16, 512, 3, 4, 128)).toEqual({ width: 4, height: 128 });
    expect(mipmapDimensions(16, 512, 4, 4, 128)).toEqual({ width: 4, height: 128 });
  });

  it('generates both terrain levels directly from the same final atlas', async () => {
    const canvases = [
      {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          imageSmoothingEnabled: true,
          clearRect: vi.fn(),
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['mip2']))),
      },
      {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          imageSmoothingEnabled: true,
          clearRect: vi.fn(),
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['mip3']))),
      },
    ] as unknown as HTMLCanvasElement[];
    vi.spyOn(document, 'createElement')
      .mockReturnValueOnce(canvases[0])
      .mockReturnValueOnce(canvases[1]);
    const bitmap = vi.fn(() => Promise.resolve({ width: 256, height: 512, close: vi.fn() }));
    vi.stubGlobal('createImageBitmap', bitmap);
    const finalTerrain = new Blob(['final-switch-terrain']);

    const generated = await generateMipmaps(finalTerrain, 256, 512, 2);

    expect(generated).toHaveLength(2);
    expect(canvases[0]).toMatchObject({ width: 128, height: 256 });
    expect(canvases[1]).toMatchObject({ width: 64, height: 128 });
    expect(bitmap).toHaveBeenCalledTimes(2);
    expect(bitmap).toHaveBeenNthCalledWith(1, finalTerrain);
    expect(bitmap).toHaveBeenNthCalledWith(2, finalTerrain);
  });
});
