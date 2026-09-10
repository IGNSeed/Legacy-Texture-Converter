import JSZip from 'jszip';
import type { VirtualFile } from '../../types/conversion';
import { ArchiveReadError } from './archiveErrors';
import { ArchiveExtractionBudget, assertArchiveInputSize } from './archiveLimits';
import { UnsafeArchivePathError, normalizeArchivePath } from './normalizeArchivePath';

export async function readZipPack(blob: Blob): Promise<VirtualFile[]> {
  assertArchiveInputSize(blob);

  try {
    const archive = await JSZip.loadAsync(blob, { createFolders: false });
    const files: VirtualFile[] = [];
    const budget = new ArchiveExtractionBudget();

    for (const entry of Object.values(archive.files)) {
      if (entry.dir) continue;
      const originalName = (
        entry as typeof entry & {
          unsafeOriginalName?: string;
        }
      ).unsafeOriginalName;
      const path = normalizeArchivePath(originalName ?? entry.name);
      const content = await entry.async('blob');
      budget.addFile(content.size);
      files.push({ path, name: path.split('/').at(-1) ?? path, blob: content });
    }

    return files;
  } catch (reason) {
    if (reason instanceof ArchiveReadError || reason instanceof UnsafeArchivePathError)
      throw reason;
    throw new ArchiveReadError('archive-corrupt', reason);
  }
}
