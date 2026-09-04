import { describe, expect, it } from 'vitest';
import { atlasOutputDimensions } from '../../src/core/atlas/composeAtlas';
import { analyzePack } from '../../src/core/analysis/analyzePack';
import {
  resolveSwitchArmorMapping,
  resolveSwitchAtlasMapping,
  resolveSwitchSpecialMapping,
  switchItemMappings,
  switchMappings,
  switchParticleMappings,
  switchTerrainMappings,
} from '../../src/core/mappings/switchMappings';

describe('Nintendo Switch Edition 1.0.17 mappings', () => {
  it('uses the verified Switch atlas dimensions and pre-Aquatic slots', () => {
    expect(atlasOutputDimensions(switchItemMappings, 16)).toEqual({
      width: 256,
      height: 272,
      scale: 1,
    });
    expect(atlasOutputDimensions(switchTerrainMappings, 32)).toEqual({
      width: 512,
      height: 1024,
      scale: 2,
    });
    expect(resolveSwitchAtlasMapping('item', 'diamond_sword')?.positions).toEqual([
      { x: 48, y: 64 },
    ]);
    expect(resolveSwitchAtlasMapping('item', 'golden_sword')?.positions).toEqual(
      resolveSwitchAtlasMapping('item', 'gold_sword')?.positions,
    );
    expect(resolveSwitchAtlasMapping('terrain', 'stone')?.positions).toEqual([{ x: 16, y: 0 }]);
  });

  it('does not assign absent Aquatic textures to unrelated slots', () => {
    for (const item of ['trident', 'cod_bucket', 'nautilus_shell', 'turtle_helmet']) {
      expect(resolveSwitchAtlasMapping('item', item)).toBeUndefined();
    }
    for (const block of ['conduit', 'turtle_egg', 'kelp', 'coral_block']) {
      expect(resolveSwitchAtlasMapping('terrain', block)).toBeUndefined();
    }
    expect(resolveSwitchAtlasMapping('particles', 'bubble')).toBeUndefined();
    expect(resolveSwitchArmorMapping('turtle_layer_1')).toBeUndefined();
    expect(resolveSwitchArmorMapping('iron_layer_1')?.destinations).toEqual([
      'Common/res/1_2_2/armor/iron_1.png',
    ]);
  });

  it('keeps particles, animated fluids, clock, and compass edition-specific', () => {
    expect(switchParticleMappings.atlas).toEqual({ width: 128, height: 128, slotSize: 8 });
    expect(resolveSwitchAtlasMapping('particles', 'critical_hit')).toBeDefined();
    expect(resolveSwitchSpecialMapping('water_still')).toMatchObject({
      destination: 'Common/res/TitleUpdate/res/textures/blocks/water.png',
      mipmapLevels: 4,
      mipmapMinimumWidth: 4,
      mipmapMinimumHeight: 128,
    });
    expect(resolveSwitchSpecialMapping('flowing_water')?.mipmapLevels).toBeUndefined();
    expect(resolveSwitchSpecialMapping('clock_item')?.animationMode).toBe('runtime');
    expect(resolveSwitchSpecialMapping('compass_item')?.animationMode).toBe('runtime');
  });

  it('counts dedicated textures even when the source parser classifies them as items or blocks', async () => {
    const summary = await analyzePack(
      {
        name: 'specials',
        edition: 'bedrock',
        files: [],
        textures: [
          {
            sourcePath: 'textures/items/clock_item.png',
            canonicalId: 'clock_item',
            category: 'item',
            blob: new Blob(),
          },
          {
            sourcePath: 'textures/blocks/portal.png',
            canonicalId: 'portal',
            category: 'terrain',
            blob: new Blob(),
          },
        ],
      },
      switchMappings,
    );
    expect(summary.recognizedCount).toBe(2);
    expect(summary.specialTextures).toEqual(['clock_item', 'portal']);
  });
});
