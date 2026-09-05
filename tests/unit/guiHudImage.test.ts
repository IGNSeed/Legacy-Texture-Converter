import { describe, expect, it } from 'vitest';
import { resizeRgbaNearest, swapRedBlueChannels } from '../../src/core/image/resizeRgbaNearest';
import { resolveHudSheetScale } from '../../src/core/gui-hud/renderHudSprite';

describe('GUI HUD normalization', () => {
  it.each([
    [256, 1],
    [512, 2],
    [1024, 4],
  ])('treats a %ipx square sheet as %ix logical scale', (size, scale) => {
    expect(resolveHudSheetScale(size, size, 256)).toBe(scale);
  });

  it('rejects non-square and non-integral GUI sheet dimensions', () => {
    expect(resolveHudSheetScale(512, 256, 256)).toBeUndefined();
    expect(resolveHudSheetScale(300, 300, 256)).toBeUndefined();
  });

  it('downscales with nearest-neighbor while preserving alpha', () => {
    const source = new Uint8ClampedArray([
      255, 0, 0, 0, 255, 0, 0, 0, 0, 255, 0, 127, 0, 255, 0, 127, 255, 0, 0, 0, 255, 0, 0, 0, 0,
      255, 0, 127, 0, 255, 0, 127, 0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 255, 64, 255, 255, 255,
      64, 0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 255, 64, 255, 255, 255, 64,
    ]);

    expect([...resizeRgbaNearest(source, 4, 4, 2, 2)]).toEqual([
      255, 0, 0, 0, 0, 255, 0, 127, 0, 0, 255, 255, 255, 255, 255, 64,
    ]);
  });

  it('swaps stored red and blue without altering green or alpha', () => {
    expect([...swapRedBlueChannels(new Uint8ClampedArray([10, 20, 30, 40]))]).toEqual([
      30, 20, 10, 40,
    ]);
  });
});
