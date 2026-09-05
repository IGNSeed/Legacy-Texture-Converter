import type { OutputFile, TargetEdition } from '../../types/conversion';
import { findArcEntry, getArcEntryData, parseArc } from '../binary/arc';
import { findFuiImage, parseFui, type ParsedFui } from '../binary/fui';
import type { BaseAssetValidation } from '../editions/common/baseAssets';
import { hudTargetMapping } from './mappings';
import type { HudTargetFuiMapping } from './types';

export function validateHudTargetFui(mapping: HudTargetFuiMapping, parsed: ParsedFui): void {
  if (parsed.images.length !== mapping.imageCount) throw new Error('fui:mapped-image-count');
  for (const mapped of mapping.entries) {
    const actual = findFuiImage(parsed, mapped.descriptor);
    if (
      !actual ||
      actual.index !== mapped.index ||
      actual.width !== mapped.width ||
      actual.height !== mapped.height
    ) {
      throw new Error(`fui:mapped-descriptor:${mapping.name}:${mapped.semantic}`);
    }
  }
}

export async function validateHudBaselineMedia(
  files: readonly OutputFile[],
  target: TargetEdition,
  validation: BaseAssetValidation,
): Promise<BaseAssetValidation> {
  const mapping = hudTargetMapping(target);
  const media = files.find((file) => file.path === mapping.mediaPath);
  if (!media || validation.missing.includes(mapping.mediaPath)) return validation;

  try {
    const archive = parseArc(new Uint8Array(await media.blob.arrayBuffer()));
    for (const fuiMapping of mapping.fuis) {
      const entry = findArcEntry(archive, fuiMapping.name);
      if (!entry) throw new Error(`arc:missing-fui:${fuiMapping.name}`);
      validateHudTargetFui(fuiMapping, parseFui(getArcEntryData(archive, entry)));
    }
    return validation;
  } catch (reason) {
    const issue = {
      path: mapping.mediaPath,
      reason: 'invalid-binary' as const,
      detail: reason instanceof Error ? reason.message : undefined,
    };
    const groups = {
      ...validation.groups,
      specialTextures: {
        ...validation.groups.specialTextures,
        ok: false,
        issues: [...validation.groups.specialTextures.issues, issue],
      },
    };
    return {
      ...validation,
      valid: false,
      groups,
      invalid: [...validation.invalid, issue],
    };
  }
}
