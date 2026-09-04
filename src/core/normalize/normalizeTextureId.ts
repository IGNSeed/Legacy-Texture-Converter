export function normalizeTextureId(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.png$/i, '')
    .replace(/^minecraft:/, '')
    .replaceAll('\\', '/')
    .split('/')
    .at(-1)!
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
