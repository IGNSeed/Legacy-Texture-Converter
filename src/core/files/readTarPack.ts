import type { VirtualFile } from '../../types/conversion';
import type { ArchiveFormat } from './archiveFormat';
import { readLibarchivePack } from './readLibarchivePack';

type TarFormat = Extract<ArchiveFormat, 'tar' | 'tar-gzip'>;

export function readTarPack(blob: Blob, format: TarFormat): Promise<VirtualFile[]> {
  return readLibarchivePack(blob, format);
}
