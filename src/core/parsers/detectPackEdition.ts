import type { SourceEdition, VirtualFile } from '../../types/conversion';

export function detectPackEdition(files: readonly VirtualFile[]): SourceEdition {
  const paths = files.map((file) => file.path.replaceAll('\\', '/').toLowerCase());
  const hasJavaMetadata = paths.some(
    (path) => path.endsWith('/pack.mcmeta') || path === 'pack.mcmeta',
  );
  const hasJavaAssets = paths.some((path) => /(^|\/)assets\/minecraft\//.test(path));
  const hasBedrockManifest = paths.some(
    (path) => path.endsWith('/manifest.json') || path === 'manifest.json',
  );
  const hasBedrockTextures = paths.some(
    (path) =>
      /(^|\/)textures\/(blocks|items)\//.test(path) ||
      /(^|\/)textures\/environment\/overworld_cubemap\/cubemap_\d+\.png$/.test(path),
  );

  if ((hasJavaMetadata || hasJavaAssets) && !(hasBedrockManifest && hasBedrockTextures))
    return 'java';
  if ((hasBedrockManifest || hasBedrockTextures) && !(hasJavaMetadata && hasJavaAssets)) {
    return 'bedrock';
  }
  return 'unknown';
}
