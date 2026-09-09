import { describe, expect, it } from 'vitest';
import {
  findSwfBitmap,
  getSwfBitmapData,
  parseSwf,
  premultiplyRgbaToArgb,
  serializeSwf,
} from '../../src/core/binary/swf';

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

function tag(code: number, payload = new Uint8Array()): Uint8Array {
  const long = payload.byteLength >= 0x3f;
  const output = new Uint8Array((long ? 6 : 2) + payload.byteLength);
  const view = new DataView(output.buffer);
  view.setUint16(0, (code << 6) | (long ? 0x3f : payload.byteLength), true);
  if (long) view.setUint32(2, payload.byteLength, true);
  output.set(payload, long ? 6 : 2);
  return output;
}

async function zlib(bytes: Uint8Array): Promise<Uint8Array> {
  const input = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice());
      controller.close();
    },
  });
  const stream = input.pipeThrough(
    new CompressionStream('deflate') as unknown as ReadableWritablePair<
      Uint8Array<ArrayBuffer>,
      Uint8Array<ArrayBuffer>
    >,
  );
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function lossless2(id: number, width: number, height: number, argb: Uint8Array) {
  const compressed = await zlib(argb);
  const payload = new Uint8Array(7 + compressed.byteLength);
  const view = new DataView(payload.buffer);
  view.setUint16(0, id, true);
  payload[2] = 5;
  view.setUint16(3, width, true);
  view.setUint16(5, height, true);
  payload.set(compressed, 7);
  return tag(36, payload);
}

async function syntheticSwf(): Promise<Uint8Array> {
  const prefix = new Uint8Array([0x08, 0, 0, 30, 1, 0]);
  const body = concat([
    prefix,
    tag(9, new Uint8Array([7, 8, 9])),
    await lossless2(10, 1, 1, new Uint8Array([255, 12, 34, 56])),
    await lossless2(11, 1, 1, new Uint8Array([255, 90, 80, 70])),
    tag(0),
  ]);
  const output = new Uint8Array(8 + body.byteLength);
  output.set([70, 87, 83, 9], 0);
  new DataView(output.buffer).setUint32(4, output.byteLength, true);
  output.set(body, 8);
  return output;
}

describe('SWF lossless bitmap reader and writer', () => {
  it('round-trips an unchanged FWS byte-for-byte', async () => {
    const bytes = await syntheticSwf();
    const parsed = await parseSwf(bytes);
    expect(parsed.signature).toBe('FWS');
    expect(parsed.version).toBe(9);
    expect(parsed.frameRate).toBe(30);
    expect(parsed.frameCount).toBe(1);
    expect(parsed.bitmaps.map((bitmap) => bitmap.characterId)).toEqual([10, 11]);
    expect(await serializeSwf(parsed, new Map())).toEqual(bytes);
  });

  it('replaces one DefineBitsLossless2 ARGB bitmap and preserves every unrelated tag', async () => {
    const original = await parseSwf(await syntheticSwf());
    const replacement = new Uint8Array([200, 100, 50, 128]);
    const rebuilt = await parseSwf(
      await serializeSwf(original, new Map([[10, { width: 1, height: 1, rgba: replacement }]])),
    );
    const bitmap = findSwfBitmap(rebuilt, 10);
    expect(bitmap).toBeDefined();
    expect((await getSwfBitmapData(rebuilt, bitmap!)).storedArgb).toEqual(
      premultiplyRgbaToArgb(replacement),
    );
    expect(rebuilt.tags[0]?.raw).toEqual(original.tags[0]?.raw);
    expect(rebuilt.tags[2]?.raw).toEqual(original.tags[2]?.raw);
    expect(rebuilt.tags.map((entry) => entry.code)).toEqual(
      original.tags.map((entry) => entry.code),
    );
  });

  it('rejects unsupported ZWS compression and malformed declared lengths', async () => {
    const zws = await syntheticSwf();
    zws.set([90, 87, 83], 0);
    await expect(parseSwf(zws)).rejects.toThrow('swf:unsupported-lzma');
    const malformed = await syntheticSwf();
    new DataView(malformed.buffer).setUint32(4, malformed.byteLength + 1, true);
    await expect(parseSwf(malformed)).rejects.toThrow('swf:length-mismatch');
  });
});
