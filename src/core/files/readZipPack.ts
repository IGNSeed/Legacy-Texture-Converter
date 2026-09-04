import JSZip from 'jszip';
import type { VirtualFile } from '../../types/conversion';
import { normalizeArchivePath } from './normalizeArchivePath';

export async function readZipPack(blob: Blob): Promise<VirtualFile[]> {
  const archive = await JSZip.loadAsync(blob, { createFolders: false });
  const files: VirtualFile[] = [];

  for (const entry of Object.values(archive.files)) {
    if (entry.dir) continue;
    const originalName = (
      entry as typeof entry & {
        unsafeOriginalName?: string;
      }
    ).unsafeOriginalName;
    const path = normalizeArchivePath(originalName ?? entry.name);
    const content = await entry.async('blob');
    files.push({ path, name: path.split('/').at(-1) ?? path, blob: content });
  }

  return files;
}
