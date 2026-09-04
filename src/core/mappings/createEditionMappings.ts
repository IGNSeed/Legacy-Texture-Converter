import type { TextureCategory } from '../../types/conversion';
import type {
  AtlasMappingDocument,
  AtlasMappingEntry,
  FileMappingEntry,
  SpecialTextureMapping,
} from '../../types/mappings';

export interface EditionMappingDocuments {
  aliases: Record<string, string>;
  items: AtlasMappingDocument;
  terrain: AtlasMappingDocument;
  particles: AtlasMappingDocument;
  armor: FileMappingEntry[];
  glint: FileMappingEntry[];
  special: SpecialTextureMapping[];
}

export interface EditionMappings extends EditionMappingDocuments {
  aliasCandidates: (id: string) => string[];
  atlasDocument: (category: TextureCategory) => AtlasMappingDocument | undefined;
  resolveAtlasMapping: (category: TextureCategory, id: string) => AtlasMappingEntry | undefined;
  resolveArmorMapping: (id: string) => FileMappingEntry | undefined;
  resolveGlintMapping: (id: string) => FileMappingEntry | undefined;
  resolveSpecialMapping: (id: string) => SpecialTextureMapping | undefined;
  resolveCategory: (id: string) => TextureCategory | undefined;
}

export function createEditionMappings(documents: EditionMappingDocuments): EditionMappings {
  function aliasCandidates(id: string): string[] {
    const candidates = new Set([id]);
    const direct = documents.aliases[id];
    if (direct) candidates.add(direct);
    for (const [alias, canonical] of Object.entries(documents.aliases)) {
      if (canonical === id) candidates.add(alias);
    }
    return [...candidates];
  }

  function matchesSourceName(id: string, names: readonly string[]): boolean {
    return aliasCandidates(id).some((candidate) => names.includes(candidate));
  }

  function atlasDocument(category: TextureCategory): AtlasMappingDocument | undefined {
    if (category === 'item') return documents.items;
    if (category === 'terrain') return documents.terrain;
    if (category === 'particles') return documents.particles;
    return undefined;
  }

  function resolveAtlasMapping(
    category: TextureCategory,
    id: string,
  ): AtlasMappingEntry | undefined {
    return atlasDocument(category)?.entries.find(
      (entry) => entry.id === id || matchesSourceName(id, entry.sourceNames),
    );
  }

  function resolveArmorMapping(id: string): FileMappingEntry | undefined {
    return documents.armor.find((entry) => matchesSourceName(id, entry.sourceNames));
  }

  function resolveGlintMapping(id: string): FileMappingEntry | undefined {
    return documents.glint.find((entry) => matchesSourceName(id, entry.sourceNames));
  }

  function resolveSpecialMapping(id: string): SpecialTextureMapping | undefined {
    return documents.special.find((entry) => matchesSourceName(id, entry.sourceNames));
  }

  function resolveCategory(id: string): TextureCategory | undefined {
    if (resolveArmorMapping(id)) return 'armor';
    if (resolveGlintMapping(id) || resolveSpecialMapping(id)) return 'special';
    if (id === 'particles' || resolveAtlasMapping('particles', id)) return 'particles';
    if (resolveAtlasMapping('item', id)) return 'item';
    if (resolveAtlasMapping('terrain', id)) return 'terrain';
    return undefined;
  }

  return {
    ...documents,
    aliasCandidates,
    atlasDocument,
    resolveAtlasMapping,
    resolveArmorMapping,
    resolveGlintMapping,
    resolveSpecialMapping,
    resolveCategory,
  };
}
