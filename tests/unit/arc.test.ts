import { describe, expect, it } from 'vitest';
import { findArcEntry, getArcEntryData, parseArc, serializeArc } from '../../src/core/binary/arc';
import { createSyntheticArc } from '../helpers/mediaArchive';

describe('Media ARC reader and writer', () => {
  it('round-trips the original bytes and preserves entry order', () => {
    const bytes = createSyntheticArc([
      ['first.bin', new Uint8Array([1, 2, 3])],
      ['folder\\second.fui', new Uint8Array([4, 5])],
    ]);
    const parsed = parseArc(bytes);

    expect(parsed.entries.map((entry) => entry.name)).toEqual(['first.bin', 'folder\\second.fui']);
    expect(serializeArc(parsed, new Map())).toEqual(bytes);
  });

  it('recalculates later offsets while preserving unrelated entry data', () => {
    const bytes = createSyntheticArc([
      ['before.bin', new Uint8Array([1, 2, 3])],
      ['target.fui', new Uint8Array([4])],
      ['after.bin', new Uint8Array([5, 6, 7, 8])],
    ]);
    const original = parseArc(bytes);
    const replacement = new Uint8Array([9, 10, 11, 12, 13, 14]);
    const rebuilt = parseArc(serializeArc(original, new Map([['target.fui', replacement]])));

    const before = findArcEntry(rebuilt, 'before.bin');
    const target = findArcEntry(rebuilt, 'target.fui');
    const after = findArcEntry(rebuilt, 'after.bin');
    expect(before && [...getArcEntryData(rebuilt, before)]).toEqual([1, 2, 3]);
    expect(target && [...getArcEntryData(rebuilt, target)]).toEqual([...replacement]);
    expect(after && [...getArcEntryData(rebuilt, after)]).toEqual([5, 6, 7, 8]);
    expect(after?.dataOffset).toBe((target?.dataOffset ?? 0) + replacement.byteLength);
  });

  it('preserves duplicate names but refuses an ambiguous name-based replacement', () => {
    const bytes = createSyntheticArc([
      ['duplicate.bin', new Uint8Array([1])],
      ['duplicate.bin', new Uint8Array([2])],
    ]);
    const parsed = parseArc(bytes);

    expect(serializeArc(parsed, new Map())).toEqual(bytes);
    expect(() => serializeArc(parsed, new Map([['duplicate.bin', new Uint8Array([3])]]))).toThrow(
      'arc:replacement-entry-ambiguous',
    );
  });

  it('rejects malformed ranges and traversal names', () => {
    const malformed = createSyntheticArc([['ok.bin', new Uint8Array([1])]]);
    new DataView(malformed.buffer).setUint32(4 + 2 + 'ok.bin'.length, 0xffffffff, false);
    expect(() => parseArc(malformed)).toThrow(/arc:/);
    expect(() => parseArc(createSyntheticArc([['..\\outside.bin', new Uint8Array([1])]]))).toThrow(
      'arc:unsafe-entry-name',
    );
  });
});
