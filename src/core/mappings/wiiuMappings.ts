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
  FileMappingEntry,
  SpecialTextureMapping,
} from '../../types/mappings';
import { createEditionMappings } from './createEditionMappings';

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

export const wiiuMappings = createEditionMappings({
  aliases,
  items: itemMappings,
  terrain: terrainMappings,
  particles: particleMappings,
  armor: armorMappings,
  glint: glintMappings,
  special: specialMappings,
});

export const aliasCandidates = wiiuMappings.aliasCandidates;
export const atlasDocument = wiiuMappings.atlasDocument;
export const resolveAtlasMapping = wiiuMappings.resolveAtlasMapping;
export const resolveArmorMapping = wiiuMappings.resolveArmorMapping;
export const resolveGlintMapping = wiiuMappings.resolveGlintMapping;
export const resolveSpecialMapping = wiiuMappings.resolveSpecialMapping;
export const resolveWiiUCategory = wiiuMappings.resolveCategory;
