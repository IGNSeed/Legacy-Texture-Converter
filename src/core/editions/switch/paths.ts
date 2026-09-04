export const SWITCH_TITLE_ID = '01006BD001E06000';
export const SWITCH_ATMOSPHERE_PREFIX = `atmosphere/contents/${SWITCH_TITLE_ID}/romfs`;

export const SWITCH_PATHS = {
  items: 'Common/res/TitleUpdate/res/items.png',
  terrain: 'Common/res/TitleUpdate/res/terrain.png',
  terrainMip2: 'Common/res/TitleUpdate/res/terrainMipMapLevel2.png',
  terrainMip3: 'Common/res/TitleUpdate/res/terrainMipMapLevel3.png',
  terrainMipmaps: [
    'Common/res/TitleUpdate/res/terrainMipMapLevel2.png',
    'Common/res/TitleUpdate/res/terrainMipMapLevel3.png',
  ],
  particles: 'Common/res/TitleUpdate/res/particles.png',
} as const;

export function switchSpecialMipmapPath(destination: string, level: number): string {
  return destination.replace(/\.png$/i, `MipMapLevel${level + 1}.png`);
}
