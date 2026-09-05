export const MAX_BINARY_FILE_SIZE = 256 * 1024 * 1024;

export function assertBinaryLength(bytes: Uint8Array, label: string): void {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BINARY_FILE_SIZE) {
    throw new Error(`${label}:invalid-file-size`);
  }
}

export function assertRange(
  offset: number,
  length: number,
  totalLength: number,
  label: string,
): void {
  if (
    !Number.isSafeInteger(offset) ||
    !Number.isSafeInteger(length) ||
    offset < 0 ||
    length < 0 ||
    offset > totalLength ||
    length > totalLength - offset
  ) {
    throw new Error(`${label}:out-of-bounds`);
  }
}

export function dataView(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
