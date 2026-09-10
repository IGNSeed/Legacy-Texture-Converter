import type { VirtualFile } from '../../types/conversion';
import { ArchiveReadError } from './archiveErrors';
import { isArchiveFileName, isMultiVolumeRarFileName } from './archiveFormat';
import { normalizeArchivePath } from './normalizeArchivePath';
import { readInputFiles } from './readInputFiles';

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
    if (entries.every((entry) => entry.isFile)) {
      const files = await Promise.all(
        entries.map((entry) => readFileEntry(entry as FileEntryLike)),
      );
      return readInputFiles(files);
    }
    const archiveEntry = entries.find((entry) => entry.isFile && isArchiveFileName(entry.name));
    if (archiveEntry) {
      throw new ArchiveReadError(
        isMultiVolumeRarFileName(archiveEntry.name) ? 'rar-multi-volume' : 'archive-unsupported',
      );
    }
    for (const entry of entries) await walkEntry(entry, virtualFiles);
  } else {
    return readInputFiles([...dataTransfer.files]);
  }

  return {
    name: entries[0]?.name ?? virtualFiles[0]?.name ?? 'TexturePack',
    files: virtualFiles,
  };
}
