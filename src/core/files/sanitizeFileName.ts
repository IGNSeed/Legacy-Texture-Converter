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

export function createSwitchDownloadName(input: string): string {
  return `${sanitizeFileName(input)}_Switch_1.0.17.zip`;
}

export function createPs3DownloadName(input: string, version: 'latest' | '1.8'): string {
  const versionLabel = version === 'latest' ? 'Latest' : '1.8';
  return `${sanitizeFileName(input)}_PS3_${versionLabel}.zip`;
}
