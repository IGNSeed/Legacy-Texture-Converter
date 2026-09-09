import { MAX_BINARY_FILE_SIZE, assertBinaryLength, assertRange, dataView } from '../bounds';
import { deflateZlib, inflateZlib } from './compression';

const SWF_HEADER_SIZE = 8;
const SWF_END_TAG = 0;
const DEFINE_BITS_LOSSLESS_2 = 36;
const FORMAT_32_BIT_ARGB = 5;
const MAX_SWF_TAGS = 65_536;

export type SwfSignature = 'FWS' | 'CWS';

export interface SwfTag {
  index: number;
  code: number;
  raw: Uint8Array;
  payload: Uint8Array;
}

export interface SwfBitmapTag extends SwfTag {
  code: 36;
  characterId: number;
  bitmapFormat: 5;
  width: number;
  height: number;
  compressedBitmapData: Uint8Array;
}

export interface ParsedSwf {
  bytes: Uint8Array;
  signature: SwfSignature;
  version: number;
  declaredLength: number;
  frameSize: Uint8Array;
  frameRate: number;
  frameCount: number;
  bodyPrefix: Uint8Array;
  tags: readonly SwfTag[];
  bitmaps: readonly SwfBitmapTag[];
}

export interface SwfBitmapData {
  width: number;
  height: number;
  storedArgb: Uint8Array;
  rgba: Uint8Array;
}

export interface SwfBitmapReplacement {
  width: number;
  height: number;
  rgba: Uint8Array;
}

function signatureOf(bytes: Uint8Array): SwfSignature {
  const signature = String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0);
  if (signature === 'FWS' || signature === 'CWS') return signature;
  if (signature === 'ZWS') throw new Error('swf:unsupported-lzma');
  throw new Error('swf:invalid-signature');
}

function frameHeaderSize(body: Uint8Array): { rectSize: number; prefixSize: number } {
  assertRange(0, 1, body.byteLength, 'swf:rect');
  const coordinateBits = (body[0] ?? 0) >>> 3;
  if (coordinateBits === 0 || coordinateBits > 31) throw new Error('swf:invalid-rect');
  const rectSize = Math.ceil((5 + coordinateBits * 4) / 8);
  const prefixSize = rectSize + 4;
  assertRange(0, prefixSize, body.byteLength, 'swf:frame-header');
  return { rectSize, prefixSize };
}

function bitmapTag(tag: SwfTag): SwfBitmapTag | undefined {
  if (tag.code !== DEFINE_BITS_LOSSLESS_2) return undefined;
  assertRange(0, 7, tag.payload.byteLength, 'swf:lossless2-header');
  const view = dataView(tag.payload);
  const bitmapFormat = tag.payload[2];
  if (bitmapFormat !== FORMAT_32_BIT_ARGB) {
    throw new Error(`swf:unsupported-lossless2-format:${bitmapFormat ?? -1}`);
  }
  const width = view.getUint16(3, true);
  const height = view.getUint16(5, true);
  if (width === 0 || height === 0 || width > 16_384 || height > 16_384) {
    throw new Error('swf:invalid-bitmap-dimensions');
  }
  return {
    ...tag,
    code: DEFINE_BITS_LOSSLESS_2,
    characterId: view.getUint16(0, true),
    bitmapFormat: FORMAT_32_BIT_ARGB,
    width,
    height,
    compressedBitmapData: tag.payload.subarray(7),
  };
}

export async function parseSwf(bytes: Uint8Array): Promise<ParsedSwf> {
  assertBinaryLength(bytes, 'swf');
  assertRange(0, SWF_HEADER_SIZE, bytes.byteLength, 'swf:header');
  const signature = signatureOf(bytes);
  const headerView = dataView(bytes);
  const declaredLength = headerView.getUint32(4, true);
  if (declaredLength < SWF_HEADER_SIZE || declaredLength > MAX_BINARY_FILE_SIZE) {
    throw new Error('swf:invalid-declared-length');
  }

  const body =
    signature === 'CWS' ? await inflateZlib(bytes.subarray(SWF_HEADER_SIZE)) : bytes.subarray(8);
  if (body.byteLength !== declaredLength - SWF_HEADER_SIZE) {
    throw new Error('swf:length-mismatch');
  }

  const { rectSize, prefixSize } = frameHeaderSize(body);
  const frameView = dataView(body);
  const frameRate = frameView.getUint16(rectSize, true) / 256;
  const frameCount = frameView.getUint16(rectSize + 2, true);
  const tags: SwfTag[] = [];
  const bitmaps: SwfBitmapTag[] = [];
  const bitmapIds = new Set<number>();
  let cursor = prefixSize;
  let sawEnd = false;

  for (let index = 0; index < MAX_SWF_TAGS && cursor < body.byteLength; index += 1) {
    const tagStart = cursor;
    assertRange(cursor, 2, body.byteLength, 'swf:tag-header');
    const shortHeader = frameView.getUint16(cursor, true);
    cursor += 2;
    const code = shortHeader >>> 6;
    let length = shortHeader & 0x3f;
    if (length === 0x3f) {
      assertRange(cursor, 4, body.byteLength, 'swf:long-tag-header');
      length = frameView.getUint32(cursor, true);
      cursor += 4;
    }
    assertRange(cursor, length, body.byteLength, 'swf:tag-payload');
    const tagEnd = cursor + length;
    const tag: SwfTag = {
      index,
      code,
      raw: body.subarray(tagStart, tagEnd),
      payload: body.subarray(cursor, tagEnd),
    };
    tags.push(tag);
    const bitmap = bitmapTag(tag);
    if (bitmap) {
      if (bitmapIds.has(bitmap.characterId)) throw new Error('swf:duplicate-bitmap-id');
      bitmapIds.add(bitmap.characterId);
      bitmaps.push(bitmap);
    }
    cursor = tagEnd;
    if (code === SWF_END_TAG) {
      if (length !== 0) throw new Error('swf:invalid-end-tag');
      sawEnd = true;
      break;
    }
  }

  if (!sawEnd) throw new Error('swf:missing-end-tag');
  if (cursor !== body.byteLength) throw new Error('swf:trailing-data');
  return {
    bytes,
    signature,
    version: bytes[3] ?? 0,
    declaredLength,
    frameSize: body.subarray(0, rectSize),
    frameRate,
    frameCount,
    bodyPrefix: body.subarray(0, prefixSize),
    tags,
    bitmaps,
  };
}

export function findSwfBitmap(swf: ParsedSwf, characterId: number): SwfBitmapTag | undefined {
  return swf.bitmaps.find((bitmap) => bitmap.characterId === characterId);
}

export function premultiplyRgbaToArgb(rgba: Uint8Array): Uint8Array {
  if (rgba.byteLength % 4 !== 0) throw new Error('swf:invalid-rgba-length');
  const argb = new Uint8Array(rgba.byteLength);
  for (let offset = 0; offset < rgba.byteLength; offset += 4) {
    const alpha = rgba[offset + 3] ?? 0;
    argb[offset] = alpha;
    argb[offset + 1] = Math.floor(((rgba[offset] ?? 0) * alpha) / 255);
    argb[offset + 2] = Math.floor(((rgba[offset + 1] ?? 0) * alpha) / 255);
    argb[offset + 3] = Math.floor(((rgba[offset + 2] ?? 0) * alpha) / 255);
  }
  return argb;
}

function unpremultiplyArgbToRgba(argb: Uint8Array): Uint8Array {
  const rgba = new Uint8Array(argb.byteLength);
  for (let offset = 0; offset < argb.byteLength; offset += 4) {
    const alpha = argb[offset] ?? 0;
    rgba[offset] = alpha ? Math.min(255, Math.round(((argb[offset + 1] ?? 0) * 255) / alpha)) : 0;
    rgba[offset + 1] = alpha
      ? Math.min(255, Math.round(((argb[offset + 2] ?? 0) * 255) / alpha))
      : 0;
    rgba[offset + 2] = alpha
      ? Math.min(255, Math.round(((argb[offset + 3] ?? 0) * 255) / alpha))
      : 0;
    rgba[offset + 3] = alpha;
  }
  return rgba;
}

export async function getSwfBitmapData(
  _swf: ParsedSwf,
  bitmap: SwfBitmapTag,
): Promise<SwfBitmapData> {
  const storedArgb = await inflateZlib(bitmap.compressedBitmapData);
  const expectedLength = bitmap.width * bitmap.height * 4;
  if (storedArgb.byteLength !== expectedLength) throw new Error('swf:bitmap-data-size');
  return {
    width: bitmap.width,
    height: bitmap.height,
    storedArgb,
    rgba: unpremultiplyArgbToRgba(storedArgb),
  };
}

function encodedTag(code: number, payload: Uint8Array): Uint8Array {
  const long = payload.byteLength >= 0x3f;
  const output = new Uint8Array((long ? 6 : 2) + payload.byteLength);
  const view = dataView(output);
  view.setUint16(0, (code << 6) | (long ? 0x3f : payload.byteLength), true);
  if (long) view.setUint32(2, payload.byteLength, true);
  output.set(payload, long ? 6 : 2);
  return output;
}

async function replacementTag(
  bitmap: SwfBitmapTag,
  replacement: SwfBitmapReplacement,
): Promise<Uint8Array> {
  if (replacement.width !== bitmap.width || replacement.height !== bitmap.height) {
    throw new Error('swf:replacement-dimensions');
  }
  if (replacement.rgba.byteLength !== replacement.width * replacement.height * 4) {
    throw new Error('swf:replacement-rgba-size');
  }
  const compressed = await deflateZlib(premultiplyRgbaToArgb(replacement.rgba));
  const payload = new Uint8Array(7 + compressed.byteLength);
  const view = dataView(payload);
  view.setUint16(0, bitmap.characterId, true);
  payload[2] = FORMAT_32_BIT_ARGB;
  view.setUint16(3, bitmap.width, true);
  view.setUint16(5, bitmap.height, true);
  payload.set(compressed, 7);
  return encodedTag(DEFINE_BITS_LOSSLESS_2, payload);
}

export async function serializeSwf(
  swf: ParsedSwf,
  replacements: ReadonlyMap<number, SwfBitmapReplacement>,
): Promise<Uint8Array> {
  if (replacements.size === 0) return swf.bytes.slice();
  for (const id of replacements.keys()) {
    if (!findSwfBitmap(swf, id)) throw new Error('swf:replacement-bitmap-missing');
  }

  const encoded = await Promise.all(
    swf.tags.map(async (tag) => {
      const bitmap =
        tag.code === DEFINE_BITS_LOSSLESS_2
          ? findSwfBitmap(swf, dataView(tag.payload).getUint16(0, true))
          : undefined;
      const replacement = bitmap ? replacements.get(bitmap.characterId) : undefined;
      return bitmap && replacement ? replacementTag(bitmap, replacement) : tag.raw;
    }),
  );
  const bodyLength =
    swf.bodyPrefix.byteLength + encoded.reduce((sum, tag) => sum + tag.byteLength, 0);
  if (bodyLength + SWF_HEADER_SIZE > MAX_BINARY_FILE_SIZE) throw new Error('swf:output-too-large');
  const body = new Uint8Array(bodyLength);
  body.set(swf.bodyPrefix, 0);
  let cursor = swf.bodyPrefix.byteLength;
  for (const tag of encoded) {
    body.set(tag, cursor);
    cursor += tag.byteLength;
  }

  const payload = swf.signature === 'CWS' ? await deflateZlib(body) : body;
  const output = new Uint8Array(SWF_HEADER_SIZE + payload.byteLength);
  output.set(
    [...swf.signature].map((value) => value.charCodeAt(0)),
    0,
  );
  output[3] = swf.version;
  dataView(output).setUint32(4, SWF_HEADER_SIZE + body.byteLength, true);
  output.set(payload, SWF_HEADER_SIZE);
  return output;
}
