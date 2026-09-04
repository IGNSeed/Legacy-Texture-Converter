import type { VirtualFile } from '../../types/conversion';
import { normalizeArchivePath } from './normalizeArchivePath';
import { readZipPack } from './readZipPack';

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
  if (inputFiles.length === 1 && /\.(zip|mcpack)$/i.test(first.name)) {
    return { name: first.name, files: await readZipPack(first) };
  }

  const files = inputFiles.map((file) => {
    const path = normalizeArchivePath(filePath(file));
    return { path, name: file.name, blob: file } satisfies VirtualFile;
  });

  const root = files[0]?.path.split('/')[0];
  const sharedRoot = root && files.every((file) => file.path.startsWith(`${root}/`));
  return { name: sharedRoot ? root : first.name, files };
}
