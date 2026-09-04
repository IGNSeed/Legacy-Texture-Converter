import type { VirtualFile } from '../../types/conversion';
import { normalizeArchivePath } from './normalizeArchivePath';
import { readZipPack } from './readZipPack';

export interface BaselineInput {
  name: string;
  files: VirtualFile[];
}

export async function readWiiUBaseline(inputFiles: readonly File[]): Promise<BaselineInput> {
  if (inputFiles.length === 0) throw new Error('empty-input');
  const files: VirtualFile[] = [];

  for (const file of inputFiles) {
    if (/\.(zip|mcpack)$/i.test(file.name)) {
      const archiveFiles = await readZipPack(file);
      files.push(
        ...archiveFiles.map((entry) => ({
          ...entry,
          path: `${normalizeArchivePath(file.name)}/${entry.path}`,
        })),
      );
      continue;
    }

    const path = normalizeArchivePath(file.webkitRelativePath || file.name);
    files.push({ path, name: file.name, blob: file });
  }

  return { name: inputFiles.length === 1 ? inputFiles[0].name : 'Wii U BASE + UPD', files };
}
