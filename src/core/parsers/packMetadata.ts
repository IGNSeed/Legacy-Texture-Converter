import type { VirtualFile } from '../../types/conversion';

type PackContentMatcher = (relativePath: string) => boolean;

interface MetadataCandidate {
  file: VirtualFile;
  path: string;
  depth: number;
  contentMatches: number;
}

function normalizeMetadataPath(path: string): string {
  return path
    .replaceAll('\\', '/')
    .replace(/^\.\/+/, '')
    .replace(/\/{2,}/g, '/')
    .toLowerCase();
}

function relativeToRoot(path: string, root: string): string | undefined {
  if (root.length === 0) return path;
  const prefix = `${root}/`;
  return path.startsWith(prefix) ? path.slice(prefix.length) : undefined;
}

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

export function nonBlankString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

export function metadataFilesByPackRoot(
  files: readonly VirtualFile[],
  metadataName: string,
  isPackContent: PackContentMatcher,
): VirtualFile[] {
  const normalizedFiles = files.map((file) => ({
    file,
    path: normalizeMetadataPath(file.path),
  }));
  const normalizedName = metadataName.toLowerCase();
  const candidates: MetadataCandidate[] = [];

  for (const metadata of normalizedFiles) {
    if (metadata.path !== normalizedName && !metadata.path.endsWith(`/${normalizedName}`)) {
      continue;
    }

    const slash = metadata.path.lastIndexOf('/');
    const root = slash < 0 ? '' : metadata.path.slice(0, slash);
    let contentMatches = 0;
    for (const candidate of normalizedFiles) {
      const relativePath = relativeToRoot(candidate.path, root);
      if (relativePath !== undefined && isPackContent(relativePath)) contentMatches += 1;
    }

    candidates.push({
      file: metadata.file,
      path: metadata.path,
      depth: root.length === 0 ? 0 : root.split('/').length,
      contentMatches,
    });
  }

  return candidates
    .sort(
      (left, right) =>
        right.contentMatches - left.contentMatches ||
        left.depth - right.depth ||
        left.path.localeCompare(right.path),
    )
    .map((candidate) => candidate.file);
}

export async function readPackMetadataValue<T>(
  files: readonly VirtualFile[],
  metadataName: string,
  isPackContent: PackContentMatcher,
  selectValue: (metadata: unknown) => T | undefined,
): Promise<T | undefined> {
  const candidates = metadataFilesByPackRoot(files, metadataName, isPackContent);
  for (const candidate of candidates) {
    try {
      const value = selectValue(JSON.parse(await candidate.blob.text()) as unknown);
      if (value !== undefined) return value;
    } catch {
      // Optional malformed metadata must not stop texture conversion.
    }
  }
  return undefined;
}
