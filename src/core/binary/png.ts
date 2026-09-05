import { assertRange, dataView } from './bounds';

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const MAX_PNG_CHUNKS = 16_384;

export interface PngMetadata {
  width: number;
  height: number;
}

export function hasPngSignature(bytes: Uint8Array, offset = 0): boolean {
  if (offset < 0 || offset > bytes.byteLength - PNG_SIGNATURE.byteLength) return false;
  return PNG_SIGNATURE.every((value, index) => bytes[offset + index] === value);
}

export function findPngSignature(bytes: Uint8Array): number {
  for (let index = 0; index <= bytes.byteLength - PNG_SIGNATURE.byteLength; index += 1) {
    if (bytes[index] === PNG_SIGNATURE[0] && hasPngSignature(bytes, index)) return index;
  }
  return -1;
}

export function inspectPngBytes(bytes: Uint8Array): PngMetadata {
  if (!hasPngSignature(bytes)) throw new Error('png:invalid-signature');
  const view = dataView(bytes);
  let offset = PNG_SIGNATURE.byteLength;
  let metadata: PngMetadata | undefined;

  for (let chunk = 0; chunk < MAX_PNG_CHUNKS; chunk += 1) {
    assertRange(offset, 12, bytes.byteLength, 'png:chunk-header');
    const dataLength = view.getUint32(offset);
    const chunkLength = dataLength + 12;
    if (!Number.isSafeInteger(chunkLength)) throw new Error('png:invalid-chunk-size');
    assertRange(offset, chunkLength, bytes.byteLength, 'png:chunk');
    const type = String.fromCharCode(
      bytes[offset + 4] ?? 0,
      bytes[offset + 5] ?? 0,
      bytes[offset + 6] ?? 0,
      bytes[offset + 7] ?? 0,
    );

    if (offset === PNG_SIGNATURE.byteLength && type !== 'IHDR') {
      throw new Error('png:missing-ihdr');
    }
    if (type === 'IHDR') {
      if (metadata || dataLength !== 13) throw new Error('png:invalid-ihdr');
      const width = view.getUint32(offset + 8);
      const height = view.getUint32(offset + 12);
      if (width === 0 || height === 0 || width > 16_384 || height > 16_384) {
        throw new Error('png:invalid-dimensions');
      }
      metadata = { width, height };
    }

    offset += chunkLength;
    if (type === 'IEND') {
      if (dataLength !== 0 || offset !== bytes.byteLength || !metadata) {
        throw new Error('png:invalid-iend');
      }
      return metadata;
    }
  }
  throw new Error('png:too-many-chunks');
}
