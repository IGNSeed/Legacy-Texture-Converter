import JSZip from 'jszip';
import type { OutputFile } from '../../types/conversion';
import { normalizeArchivePath } from '../files/normalizeArchivePath';

export async function createOutputZip(files: readonly OutputFile[]): Promise<Blob> {
  const archive = new JSZip();
  for (const file of files) archive.file(normalizeArchivePath(file.path), file.blob);
  return archive.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
