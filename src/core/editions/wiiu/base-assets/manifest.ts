import manifestJson from '../../../../../data/mappings/wiiu/default-assets.json';
import { WIIU_PATHS } from '../paths';
import type { WiiUBaseAssetGroup } from './types';

const manifest = manifestJson as { files: string[] };

export const WIIU_BASE_ASSET_PATHS = Object.freeze([...manifest.files]);

const terrainPaths = new Set<string>([
  WIIU_PATHS.terrain,
  WIIU_PATHS.terrainMip2,
  WIIU_PATHS.terrainMip3,
]);

export function baseAssetGroup(path: string): WiiUBaseAssetGroup {
  if (path === WIIU_PATHS.items) return 'items';
  if (terrainPaths.has(path)) return 'terrain';
  if (path === WIIU_PATHS.particles) return 'particles';
  if (path.includes('/armor/')) return 'armor';
  return 'specialTextures';
}

export const EXPECTED_WIIU_BASE_DIMENSIONS: Readonly<
  Partial<Record<string, { width: number; height: number }>>
> = Object.freeze({
  [WIIU_PATHS.items]: { width: 256, height: 272 },
  [WIIU_PATHS.terrain]: { width: 256, height: 544 },
  [WIIU_PATHS.terrainMip2]: { width: 128, height: 272 },
  [WIIU_PATHS.terrainMip3]: { width: 64, height: 136 },
  [WIIU_PATHS.particles]: { width: 128, height: 128 },
});
