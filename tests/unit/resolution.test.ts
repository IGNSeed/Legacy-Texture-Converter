import { describe, expect, it } from 'vitest';
import {
  isPowerOfTwo,
  resolveBlockResolution,
  resolveItemResolution,
  type TextureDimensions,
} from '../../src/core/validation/resolution';
import { createConversionReport } from '../../src/core/report/createConversionReport';
import type { ParsedPack, ParsedTexture } from '../../src/types/conversion';

const texture: ParsedTexture = {
  sourcePath: 'stone.png',
  canonicalId: 'stone',
  category: 'terrain',
  blob: new Blob(),
};
const dimension = (size: number): TextureDimensions => ({ texture, width: size, height: size });
const pack: ParsedPack = { name: 'test', edition: 'java', files: [], textures: [] };

describe('output resolution', () => {
  it('recognizes power-of-two dimensions', () => {
    expect(isPowerOfTwo(16)).toBe(true);
    expect(isPowerOfTwo(96)).toBe(false);
  });

  it('uses 16 only when all blocks are 16px', () => {
    expect(resolveBlockResolution([dimension(16)])).toBe(16);
  });

  it('uses 32 for mixed 16/32 and downscales 64+ sources to that target', () => {
    const report = createConversionReport(pack);
    expect(resolveBlockResolution([dimension(16), dimension(32), dimension(64)], report)).toBe(32);
    expect(report.warnings.map((warning) => warning.code)).toContain('mixed-block-resolution');
  });

  it('selects the largest safe item resolution and warns when mixed', () => {
    const report = createConversionReport(pack);
    expect(resolveItemResolution([dimension(16), dimension(128)], report)).toBe(128);
    expect(report.warnings.map((warning) => warning.code)).toContain('mixed-item-resolution');
  });
});
