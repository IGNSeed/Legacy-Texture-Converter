import { describe, expect, it } from 'vitest';
import { findFuiImage, getFuiImageData, parseFui, serializeFui } from '../../src/core/binary/fui';
import type { HudTargetFuiMapping } from '../../src/core/gui-hud/types';
import { createSyntheticFui, syntheticPngBytes } from '../helpers/mediaArchive';

const mapping: HudTargetFuiMapping = {
  name: 'test.fui',
  imageCount: 2,
  entries: [
    { semantic: 'first', descriptor: 10, index: 0, width: 1, height: 1 },
    { semantic: 'second', descriptor: 11, index: 1, width: 1, height: 1 },
  ],
};

describe('FUI embedded PNG reader and writer', () => {
  it('round-trips an unchanged FUI byte-for-byte', () => {
    const bytes = createSyntheticFui(mapping);
    expect(serializeFui(parseFui(bytes), new Map())).toEqual(bytes);
  });

  it('updates image size, dimensions, offsets, and the header while preserving unknown fields', () => {
    const original = parseFui(createSyntheticFui(mapping));
    const originalSecond = findFuiImage(original, 11);
    const replacement = syntheticPngBytes(2, 1, 9);
    const rebuiltBytes = serializeFui(original, new Map([[10, replacement]]));
    const rebuilt = parseFui(rebuiltBytes);
    const first = findFuiImage(rebuilt, 10);
    const second = findFuiImage(rebuilt, 11);

    expect(first).toMatchObject({ width: 2, height: 1, imageOffset: 0 });
    expect(getFuiImageData(rebuilt, first!)).toEqual(replacement);
    expect(second?.imageOffset).toBe(replacement.byteLength);
    expect(second?.unknownOffset).toBe(originalSecond?.unknownOffset);
    expect(second?.unknown1c).toBe(originalSecond?.unknown1c);
    expect(new DataView(rebuiltBytes.buffer).getUint32(8, true)).toBe(rebuiltBytes.length - 152);
  });

  it('rejects corrupted descriptor bounds', () => {
    const bytes = createSyntheticFui(mapping);
    new DataView(bytes.buffer).setUint32(152 + 20, 0, true);
    expect(() => parseFui(bytes)).toThrow('fui:invalid-descriptor');
  });
});
