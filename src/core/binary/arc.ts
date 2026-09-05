import { MAX_BINARY_FILE_SIZE, assertBinaryLength, assertRange, dataView } from './bounds';

const MAX_ARC_ENTRIES = 8_192;
const MAX_ARC_NAME_BYTES = 4_096;

export interface ArcEntry {
  index: number;
  name: string;
  nameBytes: Uint8Array;
  dataOffset: number;
  dataSize: number;
}

export interface ParsedArc {
  bytes: Uint8Array;
  entries: readonly ArcEntry[];
  tableEnd: number;
}

function readUint16Be(view: DataView, offset: number): number {
  return view.getUint16(offset, false);
}

function readUint32Be(view: DataView, offset: number): number {
  return view.getUint32(offset, false);
}

function writeUint16Be(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, false);
}

function writeUint32Be(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, false);
}

function validateEntryName(name: string): void {
  if (!name || name.includes('\0') || /^[\\/]/.test(name) || /^[a-z]:/i.test(name)) {
    throw new Error('arc:unsafe-entry-name');
  }
  const segments = name.replaceAll('\\', '/').split('/');
  if (segments.some((segment) => segment === '..' || segment.length === 0)) {
    throw new Error('arc:unsafe-entry-name');
  }
}

export function parseArc(bytes: Uint8Array): ParsedArc {
  assertBinaryLength(bytes, 'arc');
  assertRange(0, 4, bytes.byteLength, 'arc:header');
  const view = dataView(bytes);
  const entryCount = readUint32Be(view, 0);
  if (entryCount === 0 || entryCount > MAX_ARC_ENTRIES) {
    throw new Error('arc:invalid-entry-count');
  }

  const decoder = new TextDecoder('utf-8', { fatal: true });
  const entries: ArcEntry[] = [];
  let cursor = 4;

  for (let index = 0; index < entryCount; index += 1) {
    assertRange(cursor, 2, bytes.byteLength, 'arc:name-length');
    const nameLength = readUint16Be(view, cursor);
    cursor += 2;
    if (nameLength === 0 || nameLength > MAX_ARC_NAME_BYTES) {
      throw new Error('arc:invalid-name-length');
    }
    assertRange(cursor, nameLength + 8, bytes.byteLength, 'arc:entry');
    const nameBytes = bytes.subarray(cursor, cursor + nameLength);
    const name = decoder.decode(nameBytes);
    validateEntryName(name);
    cursor += nameLength;
    const dataOffset = readUint32Be(view, cursor);
    const dataSize = readUint32Be(view, cursor + 4);
    cursor += 8;
    entries.push({ index, name, nameBytes, dataOffset, dataSize });
  }

  let expectedOffset = cursor;
  for (const entry of entries) {
    if (entry.dataOffset !== expectedOffset) throw new Error('arc:non-contiguous-data');
    assertRange(entry.dataOffset, entry.dataSize, bytes.byteLength, 'arc:entry-data');
    expectedOffset += entry.dataSize;
  }
  if (expectedOffset !== bytes.byteLength) throw new Error('arc:trailing-data');

  return { bytes, entries, tableEnd: cursor };
}

export function findArcEntry(archive: ParsedArc, name: string): ArcEntry | undefined {
  const normalized = name.toLowerCase();
  return archive.entries.find((entry) => entry.name.toLowerCase() === normalized);
}

export function getArcEntryData(archive: ParsedArc, entry: ArcEntry): Uint8Array {
  return archive.bytes.subarray(entry.dataOffset, entry.dataOffset + entry.dataSize);
}

export function serializeArc(
  archive: ParsedArc,
  replacements: ReadonlyMap<string, Uint8Array>,
): Uint8Array {
  const replacementByName = new Map(
    [...replacements].map(([name, data]) => [name.toLowerCase(), data] as const),
  );
  for (const name of replacementByName.keys()) {
    const matches = archive.entries.filter((entry) => entry.name.toLowerCase() === name);
    if (matches.length === 0) throw new Error('arc:replacement-entry-missing');
    if (matches.length > 1) throw new Error('arc:replacement-entry-ambiguous');
  }

  const tableSize =
    4 + archive.entries.reduce((total, entry) => total + 2 + entry.nameBytes.byteLength + 8, 0);
  const payloadSize = archive.entries.reduce((total, entry) => {
    const replacement = replacementByName.get(entry.name.toLowerCase());
    return total + (replacement?.byteLength ?? entry.dataSize);
  }, 0);
  const outputLength = tableSize + payloadSize;
  if (!Number.isSafeInteger(outputLength) || outputLength > MAX_BINARY_FILE_SIZE) {
    throw new Error('arc:output-too-large');
  }

  const output = new Uint8Array(outputLength);
  const view = dataView(output);
  writeUint32Be(view, 0, archive.entries.length);
  let tableCursor = 4;
  let dataCursor = tableSize;

  for (const entry of archive.entries) {
    const data = replacementByName.get(entry.name.toLowerCase()) ?? getArcEntryData(archive, entry);
    writeUint16Be(view, tableCursor, entry.nameBytes.byteLength);
    tableCursor += 2;
    output.set(entry.nameBytes, tableCursor);
    tableCursor += entry.nameBytes.byteLength;
    writeUint32Be(view, tableCursor, dataCursor);
    writeUint32Be(view, tableCursor + 4, data.byteLength);
    tableCursor += 8;
    output.set(data, dataCursor);
    dataCursor += data.byteLength;
  }

  if (tableCursor !== tableSize || dataCursor !== output.byteLength) {
    throw new Error('arc:serialize-size-mismatch');
  }
  return output;
}
