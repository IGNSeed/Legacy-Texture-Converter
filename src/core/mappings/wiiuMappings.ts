import aliasesJson from '../../../data/mappings/wiiu/aliases.json';
import armorJson from '../../../data/mappings/wiiu/armor.json';
import fireJson from '../../../data/mappings/wiiu/fire.json';
import glintJson from '../../../data/mappings/wiiu/glint.json';
import itemsJson from '../../../data/mappings/wiiu/items.json';
import particlesJson from '../../../data/mappings/wiiu/particles.json';
import specialJson from '../../../data/mappings/wiiu/special-textures.json';
import terrainJson from '../../../data/mappings/wiiu/terrain.json';
import type {
  AtlasMappingDocument,
  AtlasMappingEntry,
  FileMappingEntry,
  SpecialTextureMapping,
} from '../../types/mappings';
import type { TextureCategory } from '../../types/conversion';

export const itemMappings = itemsJson as unknown as AtlasMappingDocument;
export const terrainMappings = terrainJson as unknown as AtlasMappingDocument;
export const particleMappings = particlesJson as unknown as AtlasMappingDocument;
export const armorMappings = (armorJson as { entries: FileMappingEntry[] }).entries;
export const glintMappings = (glintJson as { entries: FileMappingEntry[] }).entries;
export const specialMappings = [
  ...(fireJson as { entries: SpecialTextureMapping[] }).entries,
  ...(specialJson as { entries: SpecialTextureMapping[] }).entries,
];

const aliases = (aliasesJson as { aliases: Record<string, string> }).aliases;

export function aliasCandidates(id: string): string[] {
  const candidates = new Set([id]);
  const direct = aliases[id];
  if (direct) candidates.add(direct);
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (canonical === id) candidates.add(alias);
  }
  return [...candidates];
}

function matchesSourceName(id: string, names: readonly string[]): boolean {
  return aliasCandidates(id).some((candidate) => names.includes(candidate));
}

export function atlasDocument(category: TextureCategory): AtlasMappingDocument | undefined {
  if (category === 'item') return itemMappings;
  if (category === 'terrain') return terrainMappings;
  if (category === 'particles') return particleMappings;
  return undefined;
}

export function resolveAtlasMapping(
  category: TextureCategory,
  id: string,
): AtlasMappingEntry | undefined {
  return atlasDocument(category)?.entries.find(
    (entry) => entry.id === id || matchesSourceName(id, entry.sourceNames),
  );
}

export function resolveArmorMapping(id: string): FileMappingEntry | undefined {
  return armorMappings.find((entry) => matchesSourceName(id, entry.sourceNames));
}

export function resolveGlintMapping(id: string): FileMappingEntry | undefined {
  return glintMappings.find((entry) => matchesSourceName(id, entry.sourceNames));
}

export function resolveSpecialMapping(id: string): SpecialTextureMapping | undefined {
  return specialMappings.find((entry) => matchesSourceName(id, entry.sourceNames));
}

export function resolveWiiUCategory(id: string): TextureCategory | undefined {
  if (resolveArmorMapping(id)) return 'armor';
  if (resolveGlintMapping(id) || resolveSpecialMapping(id)) return 'special';
  if (id === 'particles' || resolveAtlasMapping('particles', id)) return 'particles';
  if (resolveAtlasMapping('item', id)) return 'item';
  if (resolveAtlasMapping('terrain', id)) return 'terrain';
  return undefined;
}
