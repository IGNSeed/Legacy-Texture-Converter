import { normalizeArchivePath } from '../files/normalizeArchivePath';

export function isArmorPowerTexturePath(input: string): boolean {
  const parts = normalizeArchivePath(input).toLowerCase().split('/');
  return parts.at(-1) === 'power.png' && parts.slice(0, -1).includes('armor');
}
