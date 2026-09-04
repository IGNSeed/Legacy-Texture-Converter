import manifestJson from '../../../../../data/mappings/switch/default-assets.json';
import type { BaseAssetGroup } from '../../common/baseAssets';
import { SWITCH_PATHS } from '../paths';

const manifest = manifestJson as { files: string[] };

export const SWITCH_BASE_ASSET_PATHS = Object.freeze([...manifest.files]);

const terrainPaths = new Set<string>([
  SWITCH_PATHS.terrain,
  SWITCH_PATHS.terrainMip2,
  SWITCH_PATHS.terrainMip3,
]);

export function switchBaseAssetGroup(path: string): BaseAssetGroup {
  if (path === SWITCH_PATHS.items) return 'items';
  if (terrainPaths.has(path)) return 'terrain';
  if (path === SWITCH_PATHS.particles) return 'particles';
  if (path.includes('/armor/')) return 'armor';
  return 'specialTextures';
}

const armorDimensions = Object.fromEntries(
  SWITCH_BASE_ASSET_PATHS.filter((path) => path.includes('/armor/')).map((path) => [
    path,
    { width: 64, height: 32 },
  ]),
);

export const EXPECTED_SWITCH_BASE_DIMENSIONS: Readonly<
  Partial<Record<string, { width: number; height: number }>>
> = Object.freeze({
  ...armorDimensions,
  [SWITCH_PATHS.items]: { width: 256, height: 272 },
  [SWITCH_PATHS.terrain]: { width: 256, height: 512 },
  [SWITCH_PATHS.particles]: { width: 128, height: 128 },
  'Common/res/TitleUpdate/res/misc/glint.png': { width: 64, height: 64 },
  'Common/res/TitleUpdate/res/textures/blocks/cauldron_water.png': {
    width: 16,
    height: 512,
  },
  'Common/res/TitleUpdate/res/textures/blocks/fire_0.png': { width: 16, height: 512 },
  'Common/res/TitleUpdate/res/textures/blocks/fire_1.png': { width: 16, height: 512 },
  'Common/res/TitleUpdate/res/textures/blocks/lava.png': { width: 16, height: 320 },
  'Common/res/TitleUpdate/res/textures/blocks/lava_flow.png': { width: 32, height: 512 },
  'Common/res/TitleUpdate/res/textures/blocks/magma.png': { width: 16, height: 48 },
  'Common/res/TitleUpdate/res/textures/blocks/portal.png': { width: 16, height: 512 },
  'Common/res/TitleUpdate/res/textures/blocks/prismarine_rough.png': {
    width: 16,
    height: 64,
  },
  'Common/res/TitleUpdate/res/textures/blocks/sea_lantern.png': { width: 16, height: 80 },
  'Common/res/TitleUpdate/res/textures/blocks/water.png': { width: 16, height: 512 },
  'Common/res/TitleUpdate/res/textures/blocks/water_flow.png': { width: 32, height: 1024 },
  'Common/res/TitleUpdate/res/textures/blocks/waterMipMapLevel2.png': {
    width: 8,
    height: 256,
  },
  'Common/res/TitleUpdate/res/textures/blocks/waterMipMapLevel3.png': {
    width: 4,
    height: 128,
  },
  'Common/res/TitleUpdate/res/textures/blocks/waterMipMapLevel4.png': {
    width: 4,
    height: 128,
  },
  'Common/res/TitleUpdate/res/textures/blocks/waterMipMapLevel5.png': {
    width: 4,
    height: 128,
  },
  'Common/res/TitleUpdate/res/textures/items/clock.png': { width: 16, height: 1024 },
  'Common/res/TitleUpdate/res/textures/items/compass.png': { width: 16, height: 512 },
});
