import aliasesJson from '../../../data/mappings/switch/aliases.json';
import armorJson from '../../../data/mappings/switch/armor.json';
import fireJson from '../../../data/mappings/switch/fire.json';
import glintJson from '../../../data/mappings/switch/glint.json';
import itemsJson from '../../../data/mappings/switch/items.json';
import particlesJson from '../../../data/mappings/switch/particles.json';
import specialJson from '../../../data/mappings/switch/special-textures.json';
import terrainJson from '../../../data/mappings/switch/terrain.json';
import type {
  AtlasMappingDocument,
  FileMappingEntry,
  SpecialTextureMapping,
} from '../../types/mappings';
import { createEditionMappings } from './createEditionMappings';

export const switchItemMappings = itemsJson as unknown as AtlasMappingDocument;
export const switchTerrainMappings = terrainJson as unknown as AtlasMappingDocument;
export const switchParticleMappings = particlesJson as unknown as AtlasMappingDocument;
export const switchArmorMappings = (armorJson as { entries: FileMappingEntry[] }).entries;
export const switchGlintMappings = (glintJson as { entries: FileMappingEntry[] }).entries;
export const switchSpecialMappings = [
  ...(fireJson as { entries: SpecialTextureMapping[] }).entries,
  ...(specialJson as { entries: SpecialTextureMapping[] }).entries,
];

export const switchMappings = createEditionMappings({
  aliases: (aliasesJson as { aliases: Record<string, string> }).aliases,
  items: switchItemMappings,
  terrain: switchTerrainMappings,
  particles: switchParticleMappings,
  armor: switchArmorMappings,
  glint: switchGlintMappings,
  special: switchSpecialMappings,
});

export const resolveSwitchAtlasMapping = switchMappings.resolveAtlasMapping;
export const resolveSwitchArmorMapping = switchMappings.resolveArmorMapping;
export const resolveSwitchGlintMapping = switchMappings.resolveGlintMapping;
export const resolveSwitchSpecialMapping = switchMappings.resolveSpecialMapping;
export const resolveSwitchCategory = switchMappings.resolveCategory;
