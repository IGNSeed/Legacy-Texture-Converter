import type { VirtualFile } from '../../types/conversion';
import { ArchiveReadError } from './archiveErrors';
import type { ArchiveFormat } from './archiveFormat';
import { readZipPack } from './readZipPack';

export async function readArchivePack(blob: Blob, format: ArchiveFormat): Promise<VirtualFile[]> {
  let files: VirtualFile[];

  switch (format) {
    case 'zip':
      files = await readZipPack(blob);
      break;
    case 'rar': {
      const { readRarPack } = await import('./readRarPack');
      files = await readRarPack(blob);
      break;
    }
    case 'tar':
    case 'tar-gzip': {
      const { readTarPack } = await import('./readTarPack');
      files = await readTarPack(blob, format);
      break;
    }
    case 'unknown':
      throw new ArchiveReadError('archive-unsupported');
  }

  if (files.length === 0) throw new ArchiveReadError('archive-empty');
  return files;
}
