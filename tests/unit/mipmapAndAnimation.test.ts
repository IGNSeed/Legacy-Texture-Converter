import { describe, expect, it } from 'vitest';
import { createLceAnimationText } from '../../src/core/convert/animationMetadata';
import { mipmapDimensions } from '../../src/core/mipmap/generateMipmaps';
import { WIIU_PATHS, specialMipmapPath } from '../../src/core/editions/wiiu/paths';

describe('derived Wii U files', () => {
  it('derives terrain mipmap dimensions from the final terrain', () => {
    expect(mipmapDimensions(256, 544, 1)).toEqual({ width: 128, height: 272 });
    expect(mipmapDimensions(256, 544, 2)).toEqual({ width: 64, height: 136 });
    expect(WIIU_PATHS.terrainMip3).toBe('Common/res/TitleUpdate/res/terrainMipMapLevel3.png');
  });

  it('creates fluid mipmap paths without BASE or UPD prefixes', () => {
    expect(specialMipmapPath('Common/res/TitleUpdate/res/textures/blocks/water.png', 1)).toMatch(
      /waterMipMapLevel2\.png$/,
    );
  });

  it('translates Java animation frame order and timing', () => {
    const metadata = JSON.stringify({
      animation: { frametime: 2, frames: [1, { index: 0, time: 4 }] },
    });
    expect(createLceAnimationText(metadata, 2)).toBe('1*2\n0*4\n');
  });
});
