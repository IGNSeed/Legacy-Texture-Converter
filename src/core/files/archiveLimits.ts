import { ArchiveReadError } from './archiveErrors';

export const ARCHIVE_LIMITS = {
  inputBytes: 1024 * 1024 * 1024,
  fileCount: 50_000,
  singleFileBytes: 512 * 1024 * 1024,
  totalBytes: 1024 * 1024 * 1024,
} as const;

export function assertArchiveInputSize(blob: Blob): void {
  if (blob.size > ARCHIVE_LIMITS.inputBytes) {
    throw new ArchiveReadError('archive-too-large');
  }
}

export class ArchiveExtractionBudget {
  private fileCount = 0;
  private totalBytes = 0;

  addFile(size: number): void {
    if (!Number.isSafeInteger(size) || size < 0) {
      throw new ArchiveReadError('archive-corrupt');
    }

    this.fileCount += 1;
    this.totalBytes += size;
    if (
      this.fileCount > ARCHIVE_LIMITS.fileCount ||
      size > ARCHIVE_LIMITS.singleFileBytes ||
      this.totalBytes > ARCHIVE_LIMITS.totalBytes
    ) {
      throw new ArchiveReadError('archive-too-large');
    }
  }
}
