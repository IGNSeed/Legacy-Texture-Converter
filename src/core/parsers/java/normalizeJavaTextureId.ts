import { normalizeTextureId } from '../../normalize/normalizeTextureId';

export function normalizeJavaTextureId(path: string): string {
  const normalizedPath = path.toLowerCase().replaceAll('\\', '/');
  const id = normalizeTextureId(path);

  // Modern Java packs store worn armor by equipment layer instead of encoding
  // the layer in the file name. Keep the mapping layer edition-independent.
  if (/(^|\/)textures\/entity\/equipment\/humanoid_leggings\//.test(normalizedPath)) {
    return toLegacyArmorLayerId(id, 2);
  }
  if (/(^|\/)textures\/entity\/equipment\/humanoid\//.test(normalizedPath)) {
    return toLegacyArmorLayerId(id, 1);
  }

  return id;
}

function toLegacyArmorLayerId(id: string, layer: 1 | 2): string {
  if (id.endsWith('_overlay')) {
    return `${id.slice(0, -'_overlay'.length)}_layer_${layer}_overlay`;
  }
  if (id === 'turtle_scute') return 'turtle_layer_1';
  return `${id}_layer_${layer}`;
}
