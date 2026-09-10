import type { VirtualFile } from '../../types/conversion';
import { ArchiveReadError } from './archiveErrors';
import { isRar4Signature, isRar5Signature } from './archiveFormat';
import { readLibarchivePack } from './readLibarchivePack';

interface VariableInteger {
  value: number;
  next: number;
}

function readVariableInteger(bytes: Uint8Array, start: number): VariableInteger | undefined {
  let value = 0;
  let multiplier = 1;

  for (let index = start; index < bytes.length && index < start + 10; index += 1) {
    const byte = bytes[index];
    value += (byte & 0x7f) * multiplier;
    if (!Number.isSafeInteger(value)) return undefined;
    if ((byte & 0x80) === 0) return { value, next: index + 1 };
    multiplier *= 128;
  }
  return undefined;
}

function inspectRar5Header(bytes: Uint8Array): void {
  const headerSize = readVariableInteger(bytes, 12);
  if (!headerSize) throw new ArchiveReadError('archive-corrupt');
  const headerEnd = headerSize.next + headerSize.value;
  const headerType = readVariableInteger(bytes, headerSize.next);
  if (!headerType || headerEnd > bytes.length) throw new ArchiveReadError('archive-corrupt');
  if (headerType.value === 4) throw new ArchiveReadError('rar-password-protected');
  if (headerType.value !== 1) throw new ArchiveReadError('archive-corrupt');

  const blockFlags = readVariableInteger(bytes, headerType.next);
  if (!blockFlags) throw new ArchiveReadError('archive-corrupt');
  let cursor = blockFlags.next;
  if ((blockFlags.value & 0x01) !== 0) {
    const extraSize = readVariableInteger(bytes, cursor);
    if (!extraSize) throw new ArchiveReadError('archive-corrupt');
    cursor = extraSize.next;
  }
  if ((blockFlags.value & 0x02) !== 0) {
    const dataSize = readVariableInteger(bytes, cursor);
    if (!dataSize) throw new ArchiveReadError('archive-corrupt');
    cursor = dataSize.next;
  }
  const archiveFlags = readVariableInteger(bytes, cursor);
  if (!archiveFlags || archiveFlags.next > headerEnd) {
    throw new ArchiveReadError('archive-corrupt');
  }
  if ((archiveFlags.value & 0x01) !== 0) {
    throw new ArchiveReadError('rar-multi-volume');
  }
}

async function inspectRarHeader(blob: Blob): Promise<void> {
  const bytes = new Uint8Array(await blob.slice(0, 128).arrayBuffer());
  if (isRar4Signature(bytes)) {
    if (bytes.length < 13 || bytes[9] !== 0x73) {
      throw new ArchiveReadError('archive-corrupt');
    }
    const flags = bytes[10] | (bytes[11] << 8);
    if ((flags & 0x0080) !== 0) throw new ArchiveReadError('rar-password-protected');
    if ((flags & 0x0001) !== 0) throw new ArchiveReadError('rar-multi-volume');
    return;
  }
  if (isRar5Signature(bytes)) {
    inspectRar5Header(bytes);
    return;
  }
  throw new ArchiveReadError('archive-corrupt');
}

export async function readRarPack(blob: Blob): Promise<VirtualFile[]> {
  await inspectRarHeader(blob);
  return readLibarchivePack(blob, 'rar');
}
