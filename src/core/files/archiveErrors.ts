export type ArchiveErrorCode =
  | 'archive-corrupt'
  | 'archive-empty'
  | 'archive-too-large'
  | 'archive-unsupported'
  | 'rar-multi-volume'
  | 'rar-password-protected';

export class ArchiveReadError extends Error {
  readonly code: ArchiveErrorCode;

  constructor(code: ArchiveErrorCode, cause?: unknown) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = 'ArchiveReadError';
    this.code = code;
  }
}
