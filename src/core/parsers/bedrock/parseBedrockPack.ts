import type {
  ParsedPack,
  ParsedTexture,
  TextureCategory,
  VirtualFile,
} from '../../../types/conversion';
import { normalizeBedrockTextureId } from './normalizeBedrockTextureId';

const SPECIAL_IDS = new Set([
  'fire_0',
  'fire_1',
  'water',
  'water_still',
  'water_flow',
  'flowing_water',
  'lava',
  'lava_still',
  'lava_flow',
  'flowing_lava',
  'enchanted_item_glint',
  'enchanted_actor_glint',
  'glint',
]);

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

async function readFlipbookMetadata(files: readonly VirtualFile[]): Promise<Map<string, string>> {
  const metadata = new Map<string, string>();
  const definitions = files.filter((file) => /(^|\/)flipbook_textures\.json$/i.test(file.path));

  for (const definition of definitions) {
    try {
      const parsed: unknown = JSON.parse(await definition.blob.text());
      if (!Array.isArray(parsed)) continue;
      for (const item of parsed) {
        const record = asRecord(item);
        const texture = record?.flipbook_texture ?? record?.texture;
        if (typeof texture !== 'string') continue;
        metadata.set(texture.toLowerCase().replace(/\.png$/, ''), JSON.stringify(record));
      }
    } catch {
      // Malformed optional metadata is reported only when its texture is converted.
    }
  }
  return metadata;
}

export function classifyBedrockTexture(path: string, id: string): TextureCategory {
  const normalized = path.toLowerCase().replaceAll('\\', '/');
  if (SPECIAL_IDS.has(id)) return 'special';
  if (/(^|\/)textures\/models\/armor\//.test(normalized)) return 'armor';
  if (/(^|\/)textures\/particles?\//.test(normalized)) return 'particles';
  if (/(^|\/)textures\/items\//.test(normalized)) return 'item';
  if (/(^|\/)textures\/blocks\//.test(normalized)) return 'terrain';
  return 'unknown';
}

export async function parseBedrockPack(
  name: string,
  files: readonly VirtualFile[],
): Promise<ParsedPack> {
  const flipbooks = await readFlipbookMetadata(files);
  const textures: ParsedTexture[] = [];

  for (const file of files) {
    if (!file.path.toLowerCase().endsWith('.png')) continue;
    const canonicalId = normalizeBedrockTextureId(file.path);
    const category = classifyBedrockTexture(file.path, canonicalId);
    if (category === 'unknown' && file.path.includes('/')) continue;
    const textureKey = file.path.toLowerCase().replace(/\.png$/, '');
    const relativeKey = textureKey.slice(textureKey.indexOf('textures/'));

    textures.push({
      sourcePath: file.path,
      canonicalId,
      category,
      blob: file.blob,
      animationMetadata: flipbooks.get(textureKey) ?? flipbooks.get(relativeKey),
    });
  }

  return { name, edition: 'bedrock', files: [...files], textures };
}
