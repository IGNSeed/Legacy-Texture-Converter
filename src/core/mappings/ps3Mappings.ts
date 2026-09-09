import latestAliasesJson from '../../../data/mappings/ps3/latest/aliases.json';
import latestArmorJson from '../../../data/mappings/ps3/latest/armor.json';
import latestFireJson from '../../../data/mappings/ps3/latest/fire.json';
import latestGlintJson from '../../../data/mappings/ps3/latest/glint.json';
import latestItemsJson from '../../../data/mappings/ps3/latest/items.json';
import latestParticlesJson from '../../../data/mappings/ps3/latest/particles.json';
import latestSpecialJson from '../../../data/mappings/ps3/latest/special-textures.json';
import latestTerrainJson from '../../../data/mappings/ps3/latest/terrain.json';
import oldAliasesJson from '../../../data/mappings/ps3/1.8/aliases.json';
import oldArmorJson from '../../../data/mappings/ps3/1.8/armor.json';
import oldFireJson from '../../../data/mappings/ps3/1.8/fire.json';
import oldGlintJson from '../../../data/mappings/ps3/1.8/glint.json';
import oldItemsJson from '../../../data/mappings/ps3/1.8/items.json';
import oldParticlesJson from '../../../data/mappings/ps3/1.8/particles.json';
import oldSpecialJson from '../../../data/mappings/ps3/1.8/special-textures.json';
import oldTerrainJson from '../../../data/mappings/ps3/1.8/terrain.json';
import type { Ps3Version } from '../../types/conversion';
import type {
  AtlasMappingDocument,
  FileMappingEntry,
  SpecialTextureMapping,
} from '../../types/mappings';
import { createEditionMappings, type EditionMappings } from './createEditionMappings';

function createPs3Mappings(version: Ps3Version): EditionMappings {
  const latest = version === 'latest';
  const armor = latest ? latestArmorJson : oldArmorJson;
  const glint = latest ? latestGlintJson : oldGlintJson;
  const fire = latest ? latestFireJson : oldFireJson;
  const special = latest ? latestSpecialJson : oldSpecialJson;
  return createEditionMappings({
    aliases: (
      (latest ? latestAliasesJson : oldAliasesJson) as {
        aliases: Record<string, string>;
      }
    ).aliases,
    items: (latest ? latestItemsJson : oldItemsJson) as unknown as AtlasMappingDocument,
    terrain: (latest ? latestTerrainJson : oldTerrainJson) as unknown as AtlasMappingDocument,
    particles: (latest ? latestParticlesJson : oldParticlesJson) as unknown as AtlasMappingDocument,
    armor: (armor as { entries: FileMappingEntry[] }).entries,
    glint: (glint as { entries: FileMappingEntry[] }).entries,
    special: [
      ...(fire as { entries: SpecialTextureMapping[] }).entries,
      ...(special as { entries: SpecialTextureMapping[] }).entries,
    ],
  });
}

export const ps3LatestMappings = createPs3Mappings('latest');
export const ps3OneEightMappings = createPs3Mappings('1.8');

export function ps3Mappings(version: Ps3Version): EditionMappings {
  return version === 'latest' ? ps3LatestMappings : ps3OneEightMappings;
}
