import type {
  ConversionEntry,
  ConversionReport,
  OutputFile,
  ParsedPack,
} from '../../types/conversion';
import { findArcEntry, getArcEntryData, parseArc, serializeArc } from '../binary/arc';
import {
  findSwfBitmap,
  getSwfBitmapData,
  parseSwf,
  premultiplyRgbaToArgb,
  serializeSwf,
  type SwfBitmapReplacement,
} from '../binary/swf';
import type { ConsoleBaseAssetSet } from '../editions/common/baseAssets';
import { addReportEntry } from '../report/createConversionReport';
import { hudSourceMappings } from './mappings';
import { renderHudSpritePixels } from './renderHudSprite';
import type {
  HudSourceEntry,
  HudTargetSwfMapping,
  HudTargetSwfMappingDocument,
  PreparedHudSheet,
} from './types';
import { validateHudTargetSwf } from './validation';

function bytesToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes.slice().buffer], { type: 'application/octet-stream' });
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((value, index) => value === right[index]);
}

function targetEntry(
  swf: HudTargetSwfMapping,
  source: HudSourceEntry,
): HudTargetSwfMapping['entries'][number] {
  const mapped = swf.entries.find((entry) => entry.semantic === source.semantic);
  if (!mapped) throw new Error(`hud-target-missing:${swf.name}:${source.semantic}`);
  return mapped;
}

function bitmapIdFromTagPayload(payload: Uint8Array): number {
  if (payload.byteLength < 2) throw new Error('swf:lossless2-header');
  return new DataView(payload.buffer, payload.byteOffset, payload.byteLength).getUint16(0, true);
}

function assertSwfStructurePreserved(
  original: Awaited<ReturnType<typeof parseSwf>>,
  rebuilt: Awaited<ReturnType<typeof parseSwf>>,
  replacements: ReadonlyMap<number, SwfBitmapReplacement>,
): void {
  if (
    rebuilt.tags.length !== original.tags.length ||
    rebuilt.frameRate !== original.frameRate ||
    rebuilt.frameCount !== original.frameCount ||
    !equalBytes(rebuilt.frameSize, original.frameSize)
  ) {
    throw new Error('swf:round-trip-structure');
  }

  for (let index = 0; index < original.tags.length; index += 1) {
    const originalTag = original.tags[index];
    const rebuiltTag = rebuilt.tags[index];
    if (!originalTag || !rebuiltTag || originalTag.code !== rebuiltTag.code) {
      throw new Error('swf:round-trip-tag-order');
    }
    const bitmap =
      originalTag.code === 36
        ? findSwfBitmap(original, bitmapIdFromTagPayload(originalTag.payload))
        : undefined;
    if (
      (!bitmap || !replacements.has(bitmap.characterId)) &&
      !equalBytes(originalTag.raw, rebuiltTag.raw)
    ) {
      throw new Error('swf:round-trip-unrelated-tag');
    }
  }
}

async function assertReplacementPixels(
  rebuilt: Awaited<ReturnType<typeof parseSwf>>,
  replacements: ReadonlyMap<number, SwfBitmapReplacement>,
): Promise<void> {
  for (const [bitmapId, replacement] of replacements) {
    const bitmap = findSwfBitmap(rebuilt, bitmapId);
    if (!bitmap) throw new Error('swf:round-trip-bitmap-missing');
    const decoded = await getSwfBitmapData(rebuilt, bitmap);
    if (!equalBytes(decoded.storedArgb, premultiplyRgbaToArgb(replacement.rgba))) {
      throw new Error('swf:round-trip-bitmap-data');
    }
  }
}

export async function convertSwfHud(
  pack: ParsedPack,
  baseline: ConsoleBaseAssetSet,
  mapping: HudTargetSwfMappingDocument,
  prepared: ReadonlyMap<string, PreparedHudSheet>,
  report: ConversionReport,
): Promise<OutputFile[]> {
  const pendingEntries: ConversionEntry[] = [];
  const mediaBlob = baseline.byPath.get(mapping.mediaPath);
  if (!mediaBlob) throw new Error('hud-baseline-media-missing');
  const archive = parseArc(new Uint8Array(await mediaBlob.arrayBuffer()));
  const rebuiltSwfs = new Map<string, Uint8Array>();

  for (const target of mapping.swfs) {
    const archiveEntry = findArcEntry(archive, target.name);
    if (!archiveEntry) throw new Error(`hud-swf-missing:${target.name}`);
    const parsed = await parseSwf(getArcEntryData(archive, archiveEntry));
    await validateHudTargetSwf(target, parsed);
    const replacements = new Map<number, SwfBitmapReplacement>();

    for (const source of hudSourceMappings.editions[pack.edition].entries) {
      const sheet = prepared.get(source.sheet);
      if (!sheet) continue;
      const mapped = targetEntry(target, source);
      const pixels = renderHudSpritePixels(
        sheet.image,
        sheet.scale,
        source.rect,
        mapped.width,
        mapped.height,
        false,
      );
      replacements.set(mapped.bitmapId, pixels);
      pendingEntries.push({
        sourcePath: sheet.texture.sourcePath,
        canonicalId: `hud.${source.semantic}`,
        destination: `${mapping.mediaPath}#${target.name}:${mapped.bitmapId}`,
        status:
          sheet.scale > 1 ||
          mapped.width !== source.rect.width ||
          mapped.height !== source.rect.height
            ? 'resized'
            : 'converted',
        sourceResolution: `${source.rect.width * sheet.scale}x${source.rect.height * sheet.scale}`,
        outputResolution: `${mapped.width}x${mapped.height}`,
      });
    }

    const rebuiltBytes = await serializeSwf(parsed, replacements);
    const rebuilt = await parseSwf(rebuiltBytes);
    await validateHudTargetSwf(target, rebuilt);
    assertSwfStructurePreserved(parsed, rebuilt, replacements);
    await assertReplacementPixels(rebuilt, replacements);
    rebuiltSwfs.set(target.name, rebuiltBytes);
  }

  if (rebuiltSwfs.size !== mapping.swfs.length) throw new Error('hud-incomplete-swf-output');
  const rebuiltArchive = serializeArc(archive, rebuiltSwfs);
  const reparsedArchive = parseArc(rebuiltArchive);
  if (reparsedArchive.entries.length !== archive.entries.length) {
    throw new Error('arc:round-trip-entry-count');
  }
  for (let index = 0; index < archive.entries.length; index += 1) {
    const original = archive.entries[index];
    const rebuilt = reparsedArchive.entries[index];
    if (!original || !rebuilt || !equalBytes(original.nameBytes, rebuilt.nameBytes)) {
      throw new Error('arc:round-trip-entry-order');
    }
    if (
      !rebuiltSwfs.has(original.name) &&
      !equalBytes(getArcEntryData(archive, original), getArcEntryData(reparsedArchive, rebuilt))
    ) {
      throw new Error('arc:round-trip-unrelated-data');
    }
  }
  for (const target of mapping.swfs) {
    const entry = findArcEntry(reparsedArchive, target.name);
    if (!entry) throw new Error(`arc:round-trip-swf-missing:${target.name}`);
    await validateHudTargetSwf(target, await parseSwf(getArcEntryData(reparsedArchive, entry)));
  }
  for (const entry of pendingEntries) addReportEntry(report, entry);
  return [{ path: mapping.mediaPath, blob: bytesToBlob(rebuiltArchive) }];
}
