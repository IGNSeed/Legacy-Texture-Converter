import type { VirtualFile } from '../../types/conversion';
import { normalizeArchivePath } from './normalizeArchivePath';
import { readZipPack } from './readZipPack';

interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
}

interface FileEntryLike extends FileSystemEntryLike {
  file: (success: (file: File) => void, error?: (reason: DOMException) => void) => void;
}

interface DirectoryReaderLike {
  readEntries: (
    success: (entries: FileSystemEntryLike[]) => void,
    error?: (reason: DOMException) => void,
  ) => void;
}

interface DirectoryEntryLike extends FileSystemEntryLike {
  createReader: () => DirectoryReaderLike;
}

function getEntry(item: DataTransferItem): FileSystemEntryLike | null {
  const candidate = item as DataTransferItem & {
    webkitGetAsEntry?: () => FileSystemEntryLike | null;
  };
  return candidate.webkitGetAsEntry?.() ?? null;
}

async function readFileEntry(entry: FileEntryLike): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function readDirectoryEntries(entry: DirectoryEntryLike): Promise<FileSystemEntryLike[]> {
  const reader = entry.createReader();
  const all: FileSystemEntryLike[] = [];
  while (true) {
    const batch = await new Promise<FileSystemEntryLike[]>((resolve, reject) =>
      reader.readEntries(resolve, reject),
    );
    if (batch.length === 0) return all;
    all.push(...batch);
  }
}

async function walkEntry(entry: FileSystemEntryLike, output: VirtualFile[]): Promise<void> {
  if (entry.isFile) {
    const file = await readFileEntry(entry as FileEntryLike);
    const path = normalizeArchivePath(entry.fullPath.replace(/^\//, ''));
    output.push({ path, name: file.name, blob: file });
    return;
  }

  if (entry.isDirectory) {
    for (const child of await readDirectoryEntries(entry as DirectoryEntryLike)) {
      await walkEntry(child, output);
    }
  }
}

export async function readDroppedItems(dataTransfer: DataTransfer): Promise<{
  name: string;
  files: VirtualFile[];
}> {
  const entries = [...dataTransfer.items].map(getEntry).filter((entry) => entry !== null);
  const virtualFiles: VirtualFile[] = [];

  if (entries.length > 0) {
    for (const entry of entries) await walkEntry(entry, virtualFiles);
  } else {
    for (const file of [...dataTransfer.files]) {
      virtualFiles.push({ path: normalizeArchivePath(file.name), name: file.name, blob: file });
    }
  }

  if (virtualFiles.length === 1 && /\.(zip|mcpack)$/i.test(virtualFiles[0].name)) {
    return { name: virtualFiles[0].name, files: await readZipPack(virtualFiles[0].blob) };
  }

  return {
    name: entries[0]?.name ?? virtualFiles[0]?.name ?? 'TexturePack',
    files: virtualFiles,
  };
}
