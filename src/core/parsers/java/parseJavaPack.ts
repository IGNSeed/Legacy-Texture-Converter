import type {
  ParsedPack,
  ParsedTexture,
  TextureCategory,
  VirtualFile,
} from '../../../types/conversion';
import { normalizeJavaTextureId } from './normalizeJavaTextureId';

const SPECIAL_IDS = new Set([
  'fire_0',
  'fire_1',
  'fire_layer_0',
  'fire_layer_1',
  'water',
  'water_still',
  'water_flow',
  'flowing_water',
  'lava',
  'lava_still',
  'lava_flow',
  'flowing_lava',
  'enchanted_item_glint',
  'glint',
]);

export function classifyJavaTexture(path: string, id: string): TextureCategory {
  const normalized = path.toLowerCase().replaceAll('\\', '/');
  if (
    ((id === 'icons' || id === 'widgets') && !normalized.includes('/')) ||
    /(^|\/)textures\/gui\/(?:icons|widgets)\.png$/.test(normalized)
  ) {
    return 'gui';
  }
  if (SPECIAL_IDS.has(id)) return 'special';
  if (
    /(^|\/)textures\/(?:models\/armor|entity\/equipment\/(?:humanoid|humanoid_leggings))\//.test(
      normalized,
    )
  ) {
    return 'armor';
  }
  if (/(^|\/)textures\/particles?\//.test(normalized)) return 'particles';
  if (/(^|\/)textures\/(?:item|items)\//.test(normalized)) return 'item';
  if (/(^|\/)textures\/(?:block|blocks)\//.test(normalized)) return 'terrain';
  return 'unknown';
}

export async function parseJavaPack(
  name: string,
  files: readonly VirtualFile[],
): Promise<ParsedPack> {
  const byPath = new Map(files.map((file) => [file.path.toLowerCase(), file]));
  const textures: ParsedTexture[] = [];

  for (const file of files) {
    if (!file.path.toLowerCase().endsWith('.png')) continue;
    const canonicalId = normalizeJavaTextureId(file.path);
    const category = classifyJavaTexture(file.path, canonicalId);
    if (category === 'unknown' && file.path.includes('/')) continue;

    const metadataFile = byPath.get(`${file.path.toLowerCase()}.mcmeta`);
    textures.push({
      sourcePath: file.path,
      canonicalId,
      category,
      blob: file.blob,
      animationMetadata: metadataFile ? await metadataFile.blob.text() : undefined,
    });
  }

  return { name, edition: 'java', files: [...files], textures };
}
