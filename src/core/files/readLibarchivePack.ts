import { ArchiveReader, libarchiveWasm } from 'libarchive-wasm';
import libarchiveWasmUrl from 'libarchive-wasm/dist/libarchive.wasm?url';
import type { VirtualFile } from '../../types/conversion';
import { ArchiveReadError } from './archiveErrors';
import type { ArchiveFormat } from './archiveFormat';
import { ArchiveExtractionBudget, assertArchiveInputSize } from './archiveLimits';
import { UnsafeArchivePathError, normalizeArchivePath } from './normalizeArchivePath';

type LibarchiveFormat = Extract<ArchiveFormat, 'rar' | 'tar' | 'tar-gzip'>;

let modulePromise: ReturnType<typeof libarchiveWasm> | undefined;

function loadLibarchive() {
  modulePromise ??= libarchiveWasm(
    import.meta.env.MODE === 'test' ? undefined : { locateFile: () => libarchiveWasmUrl },
  );
  return modulePromise;
}

function errorText(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

function archiveError(reason: unknown, format: LibarchiveFormat): ArchiveReadError {
  const detail = errorText(reason);
  if (format === 'rar' && /pass(?:word|phrase)|encrypt/i.test(detail)) {
    return new ArchiveReadError('rar-password-protected', reason);
  }
  if (format === 'rar' && /multi.?volume|next volume|split archive/i.test(detail)) {
    return new ArchiveReadError('rar-multi-volume', reason);
  }
  return new ArchiveReadError('archive-corrupt', reason);
}

export async function readLibarchivePack(
  blob: Blob,
  format: LibarchiveFormat,
): Promise<VirtualFile[]> {
  assertArchiveInputSize(blob);
  let reader: ArchiveReader | undefined;

  try {
    const module = await loadLibarchive();
    const input = new Int8Array(await blob.arrayBuffer());
    reader = new ArchiveReader(module, input);
    const files: VirtualFile[] = [];
    const budget = new ArchiveExtractionBudget();

    for (const entry of reader.entries()) {
      if (entry.getFiletype() !== 'File' || entry.getSymlinkTarget() || entry.getHardlinkTarget()) {
        continue;
      }
      if (format === 'rar' && entry.isEncrypted()) {
        throw new ArchiveReadError('rar-password-protected');
      }

      const size = entry.getSize();
      budget.addFile(size);
      const path = normalizeArchivePath(entry.getPathname());
      const extracted = entry.readData();
      const bytes = extracted === undefined ? new Uint8Array() : Uint8Array.from(extracted);
      if (bytes.byteLength !== size) throw new ArchiveReadError('archive-corrupt');
      files.push({
        path,
        name: path.split('/').at(-1) ?? path,
        blob: new Blob([bytes.buffer]),
      });
    }

    if (format === 'rar' && reader.hasEncryptedData()) {
      throw new ArchiveReadError('rar-password-protected');
    }
    const detail = reader.libarchive.error_string(reader.archive);
    if (detail) throw archiveError(detail, format);
    return files;
  } catch (reason) {
    if (reason instanceof ArchiveReadError || reason instanceof UnsafeArchivePathError)
      throw reason;
    throw archiveError(reason, format);
  } finally {
    try {
      reader?.free();
    } catch {
      // The original extraction error is more useful than a cleanup failure.
    }
  }
}
