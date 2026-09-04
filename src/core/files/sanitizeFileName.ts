const INVALID_FILE_CHARACTERS = /[<>:"/\\|?*]/g;

export function sanitizeFileName(input: string): string {
  const withoutExtension = [...input.replace(/\.(zip|mcpack)$/i, '')]
    .map((character) => (character.charCodeAt(0) < 32 ? '_' : character))
    .join('');
  const safe = withoutExtension
    .replace(INVALID_FILE_CHARACTERS, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 96);

  return safe || 'TexturePack';
}

export function createWiiUDownloadName(input: string): string {
  return `${sanitizeFileName(input)}_WiiU.zip`;
}
