import type {
  ConversionEntry,
  ConversionReport,
  OutputFile,
  ParsedPack,
  ParsedTexture,
  TargetEdition,
} from '../../types/conversion';
import { findArcEntry, getArcEntryData, parseArc, serializeArc } from '../binary/arc';
import { findFuiImage, getFuiImageData, parseFui, serializeFui } from '../binary/fui';
import { decodeImage, inspectImage, type DecodedImage } from '../image/decodeImage';
import { addReportEntry, addWarning } from '../report/createConversionReport';
import { selectGuiTexture } from '../gui-textures/selectGuiTextures';
import type { ConsoleBaseAssetSet } from '../editions/common/baseAssets';
import { hudSourceMappings, hudTargetMapping } from './mappings';
import { renderHudSprite, resolveHudSheetScale } from './renderHudSprite';
import type { HudSourceEntry, HudTargetFuiMapping, HudTargetMappingDocument } from './types';
import { validateHudTargetFui } from './validation';

interface PreparedSheet {
  texture: ParsedTexture;
  image: DecodedImage;
  scale: number;
}

interface ParsedTargetFui {
  mapping: HudTargetFuiMapping;
  parsed: ReturnType<typeof parseFui>;
}

function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes.slice().buffer], { type });
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((value, index) => value === right[index]);
}

function debugDetail(reason: unknown): string | undefined {
  return reason instanceof Error ? reason.message : undefined;
}

function warningKey(reason: unknown): { code: string; messageKey: string } {
  const message = debugDetail(reason) ?? '';
  if (message.startsWith('arc:')) {
    return { code: 'gui-arc-validation', messageKey: 'warnings.guiArcValidation' };
  }
  if (message.startsWith('fui:')) {
    return { code: 'gui-fui-validation', messageKey: 'warnings.guiFuiValidation' };
  }
  return { code: 'gui-mapping', messageKey: 'warnings.guiMapping' };
}

function sourceSheet(pack: ParsedPack, sheet: string): ParsedTexture | undefined {
  return selectGuiTexture(pack, sheet === 'icons' ? 'icons' : 'widgets');
}

async function validateReplacementDecodes(
  parsed: ReturnType<typeof parseFui>,
  descriptors: Iterable<number>,
): Promise<void> {
  for (const descriptor of descriptors) {
    const image = findFuiImage(parsed, descriptor);
    if (!image) throw new Error('fui:replacement-validation-missing');
    const decoded = await inspectImage(bytesToBlob(getFuiImageData(parsed, image), 'image/png'));
    if (decoded.width !== image.width || decoded.height !== image.height) {
      throw new Error('fui:replacement-decode-size');
    }
  }
}

function addSkippedSheets(
  report: ConversionReport,
  sheets: Iterable<PreparedSheet>,
  destination: string,
): void {
  for (const sheet of sheets) {
    addReportEntry(report, {
      sourcePath: sheet.texture.sourcePath,
      canonicalId: `hud.sheet.${sheet.texture.canonicalId}`,
      destination,
      status: 'skipped',
      messageKey: 'status.skipped',
    });
  }
}

async function prepareSheets(
  pack: ParsedPack,
  mapping: HudTargetMappingDocument,
  report: ConversionReport,
  processed: Set<string>,
): Promise<Map<string, PreparedSheet>> {
  const sourceDefinition = hudSourceMappings.editions[pack.edition];
  const prepared = new Map<string, PreparedSheet>();

  for (const sheetName of sourceDefinition.sheets) {
    const texture = sourceSheet(pack, sheetName);
    if (!texture) {
      addReportEntry(report, {
        sourcePath: `${sheetName}.png`,
        canonicalId: `hud.sheet.${sheetName}`,
        destination: mapping.mediaPath,
        status: 'preserved',
        messageKey: 'messages.guiSheetMissing',
      });
      continue;
    }
    processed.add(texture.sourcePath);
    try {
      const image = await decodeImage(texture.blob);
      const scale = resolveHudSheetScale(
        image.width,
        image.height,
        hudSourceMappings.logicalSheetSize,
      );
      if (!scale) {
        image.close();
        addWarning(report, {
          code: 'gui-sheet-dimensions',
          messageKey: 'warnings.guiSheetDimensions',
          path: texture.sourcePath,
          detail: `${image.width}x${image.height}`,
        });
        addReportEntry(report, {
          sourcePath: texture.sourcePath,
          canonicalId: `hud.sheet.${sheetName}`,
          destination: mapping.mediaPath,
          status: 'skipped',
        });
        continue;
      }
      prepared.set(sheetName, { texture, image, scale });
    } catch (reason) {
      addWarning(report, {
        code: 'gui-invalid-png',
        messageKey: 'warnings.invalidPng',
        path: texture.sourcePath,
        detail: debugDetail(reason),
      });
      addReportEntry(report, {
        sourcePath: texture.sourcePath,
        canonicalId: `hud.sheet.${sheetName}`,
        destination: mapping.mediaPath,
        status: 'skipped',
      });
    }
  }
  return prepared;
}

function targetEntry(
  fui: HudTargetFuiMapping,
  source: HudSourceEntry,
): HudTargetFuiMapping['entries'][number] {
  const mapped = fui.entries.find((entry) => entry.semantic === source.semantic);
  if (!mapped) throw new Error(`hud-target-missing:${fui.name}:${source.semantic}`);
  return mapped;
}

export async function convertHudTextures(
  pack: ParsedPack,
  baseline: ConsoleBaseAssetSet,
  target: TargetEdition,
  report: ConversionReport,
  processed: Set<string>,
): Promise<OutputFile[]> {
  const mapping = hudTargetMapping(target);
  const prepared = await prepareSheets(pack, mapping, report, processed);
  if (prepared.size === 0) return [];

  const pendingEntries: ConversionEntry[] = [];
  try {
    const mediaBlob = baseline.byPath.get(mapping.mediaPath);
    if (!mediaBlob) throw new Error('hud-baseline-media-missing');
    const archive = parseArc(new Uint8Array(await mediaBlob.arrayBuffer()));
    const parsedFuis: ParsedTargetFui[] = mapping.fuis.map((fuiMapping) => {
      const archiveEntry = findArcEntry(archive, fuiMapping.name);
      if (!archiveEntry) throw new Error(`hud-fui-missing:${fuiMapping.name}`);
      const parsed = parseFui(getArcEntryData(archive, archiveEntry));
      validateHudTargetFui(fuiMapping, parsed);
      return { mapping: fuiMapping, parsed };
    });
    const replacements = new Map<string, Map<number, Uint8Array>>(
      parsedFuis.map(({ mapping: fui }) => [fui.name, new Map<number, Uint8Array>()]),
    );
    const rendered = new Map<string, Promise<Uint8Array>>();
    const sourceEntries = hudSourceMappings.editions[pack.edition].entries;

    for (const source of sourceEntries) {
      const sheet = prepared.get(source.sheet);
      if (!sheet) continue;
      for (const targetFui of parsedFuis) {
        const mapped = targetEntry(targetFui.mapping, source);
        const cacheKey = `${source.sheet}:${source.semantic}:${mapped.width}x${mapped.height}`;
        let renderedBytes = rendered.get(cacheKey);
        if (!renderedBytes) {
          renderedBytes = renderHudSprite(
            sheet.image,
            sheet.scale,
            source.rect,
            mapped.width,
            mapped.height,
            mapping.storedColorOrder === 'bgra',
          ).then(async (blob) => new Uint8Array(await blob.arrayBuffer()));
          rendered.set(cacheKey, renderedBytes);
        }
        replacements.get(targetFui.mapping.name)?.set(mapped.descriptor, await renderedBytes);
        const sourceResolution = `${source.rect.width * sheet.scale}x${source.rect.height * sheet.scale}`;
        const outputResolution = `${mapped.width}x${mapped.height}`;
        pendingEntries.push({
          sourcePath: sheet.texture.sourcePath,
          canonicalId: `hud.${source.semantic}`,
          destination: `${mapping.mediaPath}#${targetFui.mapping.name}:${mapped.descriptor}`,
          status:
            sheet.scale > 1 ||
            mapped.width !== source.rect.width ||
            mapped.height !== source.rect.height
              ? 'resized'
              : 'converted',
          sourceResolution,
          outputResolution,
        });
      }
    }

    const rebuiltFuis = new Map<string, Uint8Array>();
    for (const targetFui of parsedFuis) {
      const fuiReplacements = replacements.get(targetFui.mapping.name);
      if (!fuiReplacements || fuiReplacements.size === 0) continue;
      const rebuilt = serializeFui(targetFui.parsed, fuiReplacements);
      const reparsed = parseFui(rebuilt);
      validateHudTargetFui(targetFui.mapping, reparsed);
      await validateReplacementDecodes(reparsed, fuiReplacements.keys());
      rebuiltFuis.set(targetFui.mapping.name, rebuilt);
    }
    if (rebuiltFuis.size !== mapping.fuis.length) throw new Error('hud-incomplete-fui-output');

    const rebuiltArchive = serializeArc(archive, rebuiltFuis);
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
        !rebuiltFuis.has(original.name) &&
        !equalBytes(getArcEntryData(archive, original), getArcEntryData(reparsedArchive, rebuilt))
      ) {
        throw new Error('arc:round-trip-unrelated-data');
      }
    }
    for (const targetFui of mapping.fuis) {
      const entry = findArcEntry(reparsedArchive, targetFui.name);
      if (!entry) throw new Error(`arc:round-trip-fui-missing:${targetFui.name}`);
      const rebuiltFui = rebuiltFuis.get(targetFui.name);
      const fuiReplacements = replacements.get(targetFui.name);
      if (!rebuiltFui || !fuiReplacements) throw new Error('arc:round-trip-fui-state');
      const archiveFui = getArcEntryData(reparsedArchive, entry);
      if (!equalBytes(archiveFui, rebuiltFui)) throw new Error('arc:round-trip-fui-data');
      const reparsedFui = parseFui(archiveFui);
      validateHudTargetFui(targetFui, reparsedFui);
      await validateReplacementDecodes(reparsedFui, fuiReplacements.keys());
    }

    for (const entry of pendingEntries) addReportEntry(report, entry);
    return [
      { path: mapping.mediaPath, blob: bytesToBlob(rebuiltArchive, 'application/octet-stream') },
    ];
  } catch (reason) {
    const warning = warningKey(reason);
    addWarning(report, {
      ...warning,
      path: mapping.mediaPath,
      detail: debugDetail(reason),
    });
    addSkippedSheets(report, prepared.values(), mapping.mediaPath);
    return [];
  } finally {
    for (const sheet of prepared.values()) sheet.image.close();
  }
}
