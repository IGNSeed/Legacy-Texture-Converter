import { describe, expect, it } from 'vitest';
import {
  normalizeArchivePath,
  UnsafeArchivePathError,
} from '../../src/core/files/normalizeArchivePath';
import { createWiiUDownloadName, sanitizeFileName } from '../../src/core/files/sanitizeFileName';
import { normalizeBedrockTextureId } from '../../src/core/parsers/bedrock/normalizeBedrockTextureId';
import { normalizeJavaTextureId } from '../../src/core/parsers/java/normalizeJavaTextureId';

describe('path normalization', () => {
  it('normalizes Java old and new texture paths to their names', () => {
    expect(normalizeJavaTextureId('assets/minecraft/textures/items/diamond_sword.png')).toBe(
      'diamond_sword',
    );
    expect(normalizeJavaTextureId('assets/minecraft/textures/block/grass_block_top.png')).toBe(
      'grass_block_top',
    );
    expect(
      normalizeJavaTextureId('assets/minecraft/textures/entity/equipment/humanoid/iron.png'),
    ).toBe('iron_layer_1');
    expect(
      normalizeJavaTextureId(
        'assets/minecraft/textures/entity/equipment/humanoid_leggings/leather_overlay.png',
      ),
    ).toBe('leather_layer_2_overlay');
  });

  it('normalizes Bedrock paths and namespaced values', () => {
    expect(normalizeBedrockTextureId('textures\\blocks\\stone.png')).toBe('stone');
    expect(normalizeBedrockTextureId('minecraft:golden_apple')).toBe('golden_apple');
  });

  it('rejects zip-slip, absolute, and drive paths', () => {
    for (const path of ['../escape.png', '/absolute.png', 'C:/drive.png', 'safe/../../escape']) {
      expect(() => normalizeArchivePath(path)).toThrow(UnsafeArchivePathError);
    }
    expect(normalizeArchivePath('./safe\\items/a.png')).toBe('safe/items/a.png');
  });

  it('creates a safe Wii U archive name', () => {
    expect(sanitizeFileName('../My:Pack?.zip')).toBe('._My_Pack_');
    expect(createWiiUDownloadName('MyPack.mcpack')).toBe('MyPack_WiiU.zip');
  });
});
