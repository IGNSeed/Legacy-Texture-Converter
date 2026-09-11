import JSZip from 'jszip';
import type { OutputFile } from '../../types/conversion';
import { normalizeArchivePath } from '../files/normalizeArchivePath';
import { isArmorPowerTexturePath } from './outputFilePolicy';

export async function createOutputZip(files: readonly OutputFile[]): Promise<Blob> {
  const archive = new JSZip();
  for (const file of files) {
    const path = normalizeArchivePath(file.path);
    if (isArmorPowerTexturePath(path)) continue;
    archive.file(path, file.blob);
  }
  return archive.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
