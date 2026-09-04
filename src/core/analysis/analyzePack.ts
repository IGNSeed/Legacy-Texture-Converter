import type { ParsedPack, ParsedTexture } from '../../types/conversion';
import {
  resolveAtlasMapping,
  resolveArmorMapping,
  resolveGlintMapping,
  resolveSpecialMapping,
  resolveWiiUCategory,
} from '../mappings/wiiuMappings';
import { inspectTextures } from '../validation/resolution';

export interface PackSummary {
  textureCount: number;
  recognizedCount: number;
  itemResolutions: number[];
  blockResolutions: number[];
  specialTextures: string[];
}

export async function analyzePack(pack: ParsedPack): Promise<PackSummary> {
  const categoryOf = (category: ParsedTexture['category'], id: string) =>
    category === 'unknown' ? resolveWiiUCategory(id) : category;
  const itemTextures = pack.textures.filter((texture) => {
    return (
      categoryOf(texture.category, texture.canonicalId) === 'item' &&
      resolveAtlasMapping('item', texture.canonicalId)
    );
  });
  const blockTextures = pack.textures.filter((texture) => {
    return (
      categoryOf(texture.category, texture.canonicalId) === 'terrain' &&
      resolveAtlasMapping('terrain', texture.canonicalId)
    );
  });
  const [items, blocks] = await Promise.all([
    inspectTextures(itemTextures),
    inspectTextures(blockTextures),
  ]);
  const recognizedCount = pack.textures.filter((texture) => {
    const category = categoryOf(texture.category, texture.canonicalId);
    if (category === 'armor') return Boolean(resolveArmorMapping(texture.canonicalId));
    if (category === 'special') {
      return Boolean(
        resolveSpecialMapping(texture.canonicalId) ?? resolveGlintMapping(texture.canonicalId),
      );
    }
    if (category === 'particles' && texture.canonicalId === 'particles') return true;
    return category ? Boolean(resolveAtlasMapping(category, texture.canonicalId)) : false;
  }).length;

  return {
    textureCount: pack.textures.length,
    recognizedCount,
    itemResolutions: [...new Set(items.map((item) => item.width))].sort((a, b) => a - b),
    blockResolutions: [...new Set(blocks.map((item) => item.width))].sort((a, b) => a - b),
    specialTextures: [
      ...new Set(
        pack.textures
          .filter((texture) => {
            const category = categoryOf(texture.category, texture.canonicalId);
            return category === 'special' || category === 'armor';
          })
          .map((texture) => texture.canonicalId),
      ),
    ],
  };
}
