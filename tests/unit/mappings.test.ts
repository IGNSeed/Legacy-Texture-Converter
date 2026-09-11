import { describe, expect, it } from 'vitest';
import {
  itemMappings,
  resolveArmorMapping,
  resolveAtlasMapping,
  resolveSpecialMapping,
  terrainMappings,
} from '../../src/core/mappings/wiiuMappings';
import { atlasOutputDimensions } from '../../src/core/atlas/composeAtlas';
import { MAX_CANVAS_DIMENSION } from '../../src/core/image/canvas';

describe('Wii U mappings', () => {
  it('resolves item slots and modern aliases', () => {
    expect(resolveAtlasMapping('item', 'diamond_sword')?.positions).toEqual([{ x: 48, y: 64 }]);
    expect(resolveAtlasMapping('item', 'golden_sword')?.positions).toEqual(
      resolveAtlasMapping('item', 'gold_sword')?.positions,
    );
  });

  it('resolves terrain slots and scales their atlas', () => {
    expect(resolveAtlasMapping('terrain', 'stone')?.positions).toEqual([{ x: 16, y: 0 }]);
    expect(atlasOutputDimensions(terrainMappings, 32)).toEqual({
      width: 512,
      height: 1088,
      scale: 2,
    });
  });

  it('scales a high-resolution item atlas from the verified base dimensions', () => {
    expect(atlasOutputDimensions(itemMappings, 64)).toEqual({
      width: 1024,
      height: 1088,
      scale: 4,
    });
  });

  it.each([
    [16, 256, 272],
    [32, 512, 544],
    [64, 1024, 1088],
    [128, 2048, 2176],
    [256, 4096, 4352],
  ] as const)('creates a %ipx item atlas at %ix%i', (slotSize, width, height) => {
    const output = atlasOutputDimensions(itemMappings, slotSize);
    expect(output).toEqual({
      width,
      height,
      scale: slotSize / 16,
    });
    expect(output.width).toBeLessThanOrEqual(MAX_CANVAS_DIMENSION);
    expect(output.height).toBeLessThanOrEqual(MAX_CANVAS_DIMENSION);
  });

  it('maps Java and Bedrock armor names to exact Wii U paths', () => {
    expect(resolveArmorMapping('leather_layer_1_overlay')?.destinations).toContain(
      'Common/res/TitleUpdate/res/armor/cloth_1_b.png',
    );
    expect(resolveArmorMapping('chain_1')?.destinations).toEqual([
      'Common/res/1_2_2/armor/chain_1.png',
    ]);
  });

  it('preserves base fluids while retaining fire conversion', () => {
    expect(resolveSpecialMapping('water_still')).toMatchObject({
      destination: 'Common/res/TitleUpdate/res/textures/blocks/water.png',
      inputPolicy: 'preserve-base',
    });
    expect(resolveSpecialMapping('fire_layer_0')?.animationText).toMatch(/fire_0\.txt$/);
  });
});
