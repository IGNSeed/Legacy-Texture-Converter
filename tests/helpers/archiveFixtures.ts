type TarEntryType = 'directory' | 'file' | 'hardlink' | 'symlink';

export interface TarFixtureEntry {
  path: string;
  content?: string | Uint8Array;
  linkPath?: string;
  type?: TarEntryType;
}

const encoder = new TextEncoder();

function writeBytes(target: Uint8Array, offset: number, bytes: Uint8Array, length: number): void {
  target.set(bytes.subarray(0, length), offset);
}

function writeText(target: Uint8Array, offset: number, value: string, length: number): void {
  writeBytes(target, offset, encoder.encode(value), length);
}

function writeOctal(target: Uint8Array, offset: number, value: number, length: number): void {
  writeText(target, offset, `${value.toString(8).padStart(length - 1, '0')}\0`, length);
}

function entryContent(entry: TarFixtureEntry): Uint8Array {
  if (entry.type && entry.type !== 'file') return new Uint8Array();
  if (typeof entry.content === 'string') return encoder.encode(entry.content);
  return entry.content ?? new Uint8Array();
}

function tarTypeFlag(type: TarEntryType | undefined): string {
  switch (type) {
    case 'directory':
      return '5';
    case 'hardlink':
      return '1';
    case 'symlink':
      return '2';
    case 'file':
    case undefined:
      return '0';
  }
}

function createHeader(entry: TarFixtureEntry, size: number): Uint8Array {
  const header = new Uint8Array(512);
  writeText(header, 0, entry.path, 100);
  writeOctal(header, 100, entry.type === 'directory' ? 0o755 : 0o644, 8);
  writeOctal(header, 108, 0, 8);
  writeOctal(header, 116, 0, 8);
  writeOctal(header, 124, size, 12);
  writeOctal(header, 136, 1_700_000_000, 12);
  header.fill(0x20, 148, 156);
  writeText(header, 156, tarTypeFlag(entry.type), 1);
  if (entry.linkPath) writeText(header, 157, entry.linkPath, 100);
  writeText(header, 257, 'ustar\0', 6);
  writeText(header, 263, '00', 2);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  writeText(header, 148, `${checksum.toString(8).padStart(6, '0')}\0 `, 8);
  return header;
}

export function createTarFixture(entries: readonly TarFixtureEntry[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  let totalSize = 1024;

  for (const entry of entries) {
    const content = entryContent(entry);
    const paddedSize = Math.ceil(content.byteLength / 512) * 512;
    const chunk = new Uint8Array(512 + paddedSize);
    chunk.set(createHeader(entry, content.byteLength));
    chunk.set(content, 512);
    chunks.push(chunk);
    totalSize += chunk.byteLength;
  }

  const archive = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    archive.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return archive;
}

function decodeBase64(value: string): Uint8Array {
  const decoded = atob(value);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

// Tiny MIT-licensed RAR fixtures from ofk/libarchive-wasm, commit 1d04437.
export const rar4Fixture = decodeBase64(
  'UmFyIRoHAM+QcwAADQAAAAAAAAA1J3QggDEAUQAAAJAAAAAD/QHkiS9d9lYdMxEApIEAAGV4YW1wbGVcUkVBRE1FLm1kCVQQy+TO/sKQb52DIMsaXAnhnEeGdCEgIu9tbcg0smGe/T/IveyC+4+SWUDANPACnrsnB0H5f4Dm3DHJrFdXJyTtINOlgkd7dEUnmyUX+47QtT50IIAzAFEAAACQAAAAA/0B5IkvXfZWHTMTAKSBAABleGFtcGxlXGRpclxzeW1saW5rCVQQy+TO/sKQb52DIMsaXAnhnEeGdCEgIu9tbcg0smGe/T/IveyC+4+SWUDANPACnrsnB0H5f4Dm3DHJrFdXJyTtINOlgkd7dEUnmyUX+47QYOV0IIA1AFgBAAAXBgAAA/quCoMvXfZWHTMVAKSBAABleGFtcGxlXGRpclxpbWFnZS5wbmcKIWIQi9XA3/2WmUG6+EIWlmCiggocKIGamOSeIeOooIsamLJL4AoiIsG4cJyXOwfgsY6wS4mDgrGlqKksqgngeIRCwgSug6JiG6wonKXOwtZw7H+w9/Y+PHvg+nPHjx4PHsP0/Po78HIwt8oTqk4PsUCMw8GZItmd1HQTfPlacrX6UPaIGxwtJ7Ji4BTwapZdJCOwXVSlTzwqxUS498OH0L3dttDy+OQZl7fmljxpb5YA2r5KRnSr1rGS3SQUdP/2AshKYXv1vXUWWnwY0xzImUlr9ZW7W6N4OWiTNfnPcaBR8V/4xTnGxoeHMckJ4kNLkY4BPcY670xtM6K7DqImRZ3/pqcJFjnJn8FDD1NxGzTN3oGfd/lIx05QZ1W7Bu29d0KIE5PucnV/mgIDBkPFkIp77LmCK6Q3N/6ewJVxrz4N2oAHnyldcPAhvhZu+gCMhQyb3HH+EIcgdOCAKwAAAAAAAAAAAAMAAAAAL132VhQwCwDtQQAAZXhhbXBsZVxkaXJ0n3TggCcAAAAAAAAAAAADAAAAAC9d9lYUMAcA7UEAAGV4YW1wbGXEPXsAQAcA',
);

export const rar5Fixture = decodeBase64(
  'UmFyIRoHAQDz4YLrCwEFBwAGAQGAgIAAGLsc3ycCAtIABpABpIMC2kG7ZP0B5ImAAwERZXhhbXBsZS9SRUFETUUubWTA1U8lUEMvkzv7CkG+dgyDLGlwLuGcR4Z0ISAi7/Ug0scb9+n+Te9l+OCdG1JIAERAddt15Sw+r8AdX5Z6Pc0LkoLW+g27aSz4/KKxxR1Jx8wAF3gdJikCAtIABpABpIMC2kG7ZP0B5ImAAwETZXhhbXBsZS9kaXIvc3ltbGlua8DVTyVQQy+TO/sKQb52DIMsaXAu4ZxHhnQhICLv9SDSxxv36f5N72X44J0bUkgAREB123XlLD6vwB1flno9zQuSgtb6DbtpLPj8orHFHUnHzACT20YFKwIC3gIGlwykgwLaQbtk+q4Kg4ADARVleGFtcGxlL2Rpci9pbWFnZS5wbmfJyFoBJ2VXQi9WBG/stNiDZekIWlmCiggodFEDNTGJOEOGUUEWmpi1JegKIiLQ2DonUuu0PotMZaEsJgwK00tRUlqqCcBwhELRAlZBkTENmijJ1Wi2zoz4T3vTndPTw53vfkHDhw4HDmjz98O/fBng42ArVLVQAAVithMNGibbnxS0X5Z9Lbncfaj7xRGmJqQJkjCLfj1bXrJT2TGsWLOmLXLSnfzixupk+uNwidyyzc3d9VMqTOgrwHVvNTNqdkwaTHSiInqf/EGEqTTOGv7aq01eLIRnnR8xTY7C58w074gxME4+s95uHKx4XnIPd7Wl5dB6grkS2ckngK8DXviEdUPS+4+kKl2uD7a3GTZ6AUKIlh6nYzlvn8EPRvUSw588g3suWbpz774ccN4hd5ev/PAJERlP18UuB8MWaa8S3u/9PYE262aE5duACCE1dYEQ40EZH/oArUYQq/ySAKfw/REfAgIABwDtgwHaQbtkAAAAAIAAAQtleGFtcGxlL2RpcrcN4hAbAgIABwDtgwHaQbtkAAAAAIAAAQdleGFtcGxlHXdWUQMFBAA=',
);

export const passwordProtectedRar4Fixture = decodeBase64(
  'UmFyIRoHAM6Zc4AADQAAAAAAAAD5ohXUuX9Q61sgIFU0VlbV/qcyT08DdsQ8HWlp9h/wHSTKMiiUf/Rkbnpg5I9xnM2bFCW15HED2gfsK2zT//xg8JG3vTiKFKxjhR6nfFULe4Iug7JSet+sG19VBtXcd4nTcqkuqz0JtkSV8fTwum14QF3KjoJkzZ8JK+Zj3WVsdQwoEqvpXai4uGJC21ga24Fy5JBBK/CgYFuf9a4vy8pX0eHZbBm/PrT5ohXUuX9Q65sv5eJMe8wIrsiXJ/IGT6kEgLC6SvYjj5kq0ZYAyvhnRJGLizNxcPSzR+32UJhfDv0fXBS619CBxz+pYXpHEVxjhR6nfFULe4Iug7JSet+sG19VBtXcd4nTcqkuqz0JtkSV8fTwum14QF3KjoJkzZ8JK+Zj3WVsdQwoEqvpXai4uGJC21ga24Fy5JBBK/CgYFuf9a4vy8pX0eHZbBm/PrT5ohXUuX9Q6xLph6Uc02DLP0bu5jLeyRlEAXEKWfLfr4Pkqfcdw5VRGd2g9j61Sko5OVLFPGvuMQNn7nfmFQNULKcOumz1Usiv7MMMOYd6eyM1qH8flmdAO1GfnzYJmTotqdrAOV7j+GVzPQVR4XsPvYuF2oQvGbEeVjW7szz5ImkYAKVNLPunGWOyQZf6ogXttYHylQzwt2tSSXG1p3XWO5JO8YFGL5NWWJ7zD2am9tc/JUQ4GUinKurky2v6NIbT7NO2002lzeJ2f5RX3ulkoec4BqXx9e5VoXNpnCyqGhJUI3TVEu5gWOCdkv8Wr/Ew1QpIme11p5ABTXL7IO1YJ2J0Ch6pFQWrfRsJoB/v/Mq+orsaYHh7J6Fpnz5zHOsmMGLgYnrrhBFJ6ufPjGFYuPszrxAEIfnN+YR5u1cpduYOY3Ka0iPgfbVFaHXMU5pqW7D+TqeisoQq1ePdBudqzC9BDJIg445E98rjBn61ditt/qWjbsqNpyYriXb6NRU+QxAhIZ9eUcB+sSSpZZngT9w3TkYwQZJHgjCWi/K/6KJBWMnmWr6e+aIV1Ll/UOsRsIBp4+OjVksgYkZ28w+hazHJCCwVOkOJIsz0vUbhPnwdFGSZls/B7iwNeAIbf/L5ohXUuX9Q64ZBK37PlwXgqxEfYOKKrPMWPzveYP3LoMAUMVbhpKdMt9LITCYMxACSaKUAVQbDXfmiFdS5f1Dr4qpIEPO3sQfacb+Sid4A+Q==',
);
