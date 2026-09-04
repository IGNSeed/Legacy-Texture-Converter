import { normalizeTextureId } from '../../normalize/normalizeTextureId';

export function normalizeBedrockTextureId(path: string): string {
  return normalizeTextureId(path);
}
