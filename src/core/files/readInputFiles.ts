import type { VirtualFile } from '../../types/conversion';
import { ArchiveReadError } from './archiveErrors';
import { detectArchiveFormat, isArchiveFileName, isMultiVolumeRarFileName } from './archiveFormat';
import { normalizeArchivePath } from './normalizeArchivePath';
import { readArchivePack } from './readArchivePack';

export interface ReadInputResult {
  name: string;
  files: VirtualFile[];
}

function filePath(file: File): string {
  return file.webkitRelativePath || file.name;
}

export async function readInputFiles(inputFiles: readonly File[]): Promise<ReadInputResult> {
  if (inputFiles.length === 0) throw new Error('empty-input');

  const first = inputFiles[0];
  const directFiles = inputFiles.filter((file) => !file.webkitRelativePath);
  if (inputFiles.length === 1 && directFiles.length === 1) {
    const format = await detectArchiveFormat(first);
    if (format !== 'unknown') {
      return { name: first.name, files: await readArchivePack(first, format) };
    }
  } else if (directFiles.some((file) => isArchiveFileName(file.name))) {
    const multiVolume = directFiles.find((file) => isMultiVolumeRarFileName(file.name));
    throw new ArchiveReadError(multiVolume ? 'rar-multi-volume' : 'archive-unsupported');
  }

  const files = inputFiles.map((file) => {
    const path = normalizeArchivePath(filePath(file));
    return { path, name: file.name, blob: file } satisfies VirtualFile;
  });

  const root = files[0]?.path.split('/')[0];
  const sharedRoot = root && files.every((file) => file.path.startsWith(`${root}/`));
  return { name: sharedRoot ? root : first.name, files };
}
