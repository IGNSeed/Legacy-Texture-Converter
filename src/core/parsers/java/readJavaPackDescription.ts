import type { VirtualFile } from '../../../types/conversion';
import { asRecord, nonBlankString, readPackMetadataValue } from '../packMetadata';

function isJavaPackContent(relativePath: string): boolean {
  return relativePath.startsWith('assets/minecraft/');
}

export function javaTextComponentToPlainText(component: unknown): string | undefined {
  if (typeof component === 'string') return component;

  if (Array.isArray(component)) {
    const parts = component
      .map(javaTextComponentToPlainText)
      .filter((part): part is string => part !== undefined);
    return parts.length > 0 ? parts.join('') : undefined;
  }

  const record = asRecord(component);
  if (!record) return undefined;

  const parts: string[] = [];
  const text = javaTextComponentToPlainText(record.text);
  const extra = javaTextComponentToPlainText(record.extra);
  if (text !== undefined) parts.push(text);
  if (extra !== undefined) parts.push(extra);
  return parts.length > 0 ? parts.join('') : undefined;
}

export function readJavaPackDescription(
  files: readonly VirtualFile[],
): Promise<string | undefined> {
  return readPackMetadataValue(files, 'pack.mcmeta', isJavaPackContent, (metadata) => {
    const pack = asRecord(asRecord(metadata)?.pack);
    return nonBlankString(javaTextComponentToPlainText(pack?.description));
  });
}
