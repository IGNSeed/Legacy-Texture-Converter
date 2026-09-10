import { ArchiveReadError } from './archiveErrors';

export type ArchiveFormat = 'zip' | 'rar' | 'tar' | 'tar-gzip' | 'unknown';

const RAR4_SIGNATURE = [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00] as const;
const RAR5_SIGNATURE = [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00] as const;

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

function formatFromName(name: string): ArchiveFormat {
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith('.tar.gz') || lowerName.endsWith('.tgz')) return 'tar-gzip';
  if (lowerName.endsWith('.zip') || lowerName.endsWith('.mcpack')) return 'zip';
  if (lowerName.endsWith('.rar')) return 'rar';
  if (lowerName.endsWith('.tar')) return 'tar';
  return 'unknown';
}

function formatFromMagic(bytes: Uint8Array): ArchiveFormat {
  if (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
      (bytes[2] === 0x05 && bytes[3] === 0x06) ||
      (bytes[2] === 0x07 && bytes[3] === 0x08))
  ) {
    return 'zip';
  }
  if (startsWith(bytes, RAR5_SIGNATURE) || startsWith(bytes, RAR4_SIGNATURE)) return 'rar';
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) return 'tar-gzip';
  if (new TextDecoder().decode(bytes.subarray(257, 262)) === 'ustar') return 'tar';
  return 'unknown';
}

export function isMultiVolumeRarFileName(name: string): boolean {
  return /(?:\.part\d+\.rar|\.r\d{2,3})$/i.test(name);
}

export function isUnsupportedArchiveFileName(name: string): boolean {
  return /(?:\.tar\.bz2|\.tbz2|\.tar\.xz|\.txz|\.7z)$/i.test(name);
}

export function isArchiveFileName(name: string): boolean {
  return (
    formatFromName(name) !== 'unknown' ||
    isMultiVolumeRarFileName(name) ||
    isUnsupportedArchiveFileName(name)
  );
}

export async function detectArchiveFormat(file: Blob & { name: string }): Promise<ArchiveFormat> {
  if (isMultiVolumeRarFileName(file.name)) {
    throw new ArchiveReadError('rar-multi-volume');
  }
  if (isUnsupportedArchiveFileName(file.name)) {
    throw new ArchiveReadError('archive-unsupported');
  }

  const namedFormat = formatFromName(file.name);
  const header = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  const magicFormat = formatFromMagic(header);

  if (namedFormat === 'unknown') return magicFormat;
  if (magicFormat === namedFormat) return namedFormat;

  // Empty and old V7 TAR archives do not necessarily carry the POSIX ustar marker.
  if (namedFormat === 'tar' && magicFormat === 'unknown') return 'tar';
  if (magicFormat !== 'unknown') throw new ArchiveReadError('archive-unsupported');
  throw new ArchiveReadError('archive-corrupt');
}

export function isRar4Signature(bytes: Uint8Array): boolean {
  return startsWith(bytes, RAR4_SIGNATURE);
}

export function isRar5Signature(bytes: Uint8Array): boolean {
  return startsWith(bytes, RAR5_SIGNATURE);
}
