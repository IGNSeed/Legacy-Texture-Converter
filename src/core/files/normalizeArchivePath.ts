export class UnsafeArchivePathError extends Error {
  constructor(path: string) {
    super(`Unsafe archive path: ${path}`);
    this.name = 'UnsafeArchivePathError';
  }
}

export function normalizeArchivePath(input: string): string {
  const slashPath = input.replaceAll('\\', '/').replace(/^\.\//, '');

  if (
    slashPath.length === 0 ||
    slashPath.includes('\0') ||
    slashPath.startsWith('/') ||
    /^[a-zA-Z]:/.test(slashPath)
  ) {
    throw new UnsafeArchivePathError(input);
  }

  const parts = slashPath.split('/').filter((part) => part !== '' && part !== '.');
  if (parts.some((part) => part === '..')) {
    throw new UnsafeArchivePathError(input);
  }

  return parts.join('/');
}

export function normalizeLookupPath(input: string): string {
  return normalizeArchivePath(input).toLowerCase();
}
