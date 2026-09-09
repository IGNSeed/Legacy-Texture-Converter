import type {
  ConversionOptions,
  ConversionResult,
  OutputFile,
  ParsedPack,
  ParsedTexture,
  ProgressCallback,
  Ps3Version,
  TargetEdition,
} from '../../../types/conversion';
import { composeAtlas } from '../../atlas/composeAtlas';
import { convertFileTextures } from '../../convert/convertFileTextures';
import { convertSpecialTextures } from '../../convert/convertSpecialTextures';
import { convertGuiTextures } from '../../gui-textures/convertGuiTextures';
import { inspectImage } from '../../image/decodeImage';
import { convertHudTextures } from '../../gui-hud/convertHudTextures';
import { hudTargetMapping } from '../../gui-hud/mappings';
import type { EditionMappings } from '../../mappings/createEditionMappings';
import { generateMipmaps } from '../../mipmap/generateMipmaps';
import { createOutputZip } from '../../packaging/createOutputZip';
import { addReportEntry, createConversionReport } from '../../report/createConversionReport';
import { convertSkyTexture } from '../../sky/convertSkyTexture';
import {
  inspectTextures,
  resolveBlockResolution,
  resolveItemResolution,
  resolveParticleResolution,
} from '../../validation/resolution';
import type { ConsoleBaseAssetSet } from './baseAssets';

export interface ConsoleEditionPaths {
  items: string;
  terrain: string;
  terrainMipmaps: readonly string[];
  particles: string;
  guiIcons: string;
  guiWidgets: string;
  sky: string;
}

export interface ConsoleConversionDefinition<TTarget extends TargetEdition> {
  target: TTarget;
  ps3Version?: Ps3Version;
  mappings: EditionMappings;
  paths: ConsoleEditionPaths;
  createDownloadName: (inputName: string) => string;
  buildFileTree: (
    defaults: readonly OutputFile[],
    overrides: readonly OutputFile[],
  ) => OutputFile[];
  specialMipmapPath: (destination: string, level: number) => string;
  preserveUnmodifiedMedia?: boolean;
}

function progress(
  onProgress: ProgressCallback | undefined,
  stage: Parameters<ProgressCallback>[0]['stage'],
  percent: number,
): void {
  onProgress?.({ stage, percent });
}

function mappedTextures(
  pack: ParsedPack,
  category: ParsedTexture['category'],
  mappings: EditionMappings,
): ParsedTexture[] {
  return pack.textures.filter(
    (texture) =>
      (texture.category === category ||
        (texture.category === 'unknown' &&
          mappings.resolveCategory(texture.canonicalId) === category)) &&
      mappings.resolveAtlasMapping(category, texture.canonicalId),
  );
}

function texturesFor(
  pack: ParsedPack,
  category: ParsedTexture['category'],
  mappings: EditionMappings,
): ParsedTexture[] {
  return pack.textures.filter(
    (texture) =>
      texture.category === category ||
      (texture.category === 'unknown' &&
        mappings.resolveCategory(texture.canonicalId) === category),
  );
}

export async function convertConsolePack<TTarget extends TargetEdition>(
  pack: ParsedPack,
  baseline: ConsoleBaseAssetSet<TTarget>,
  definition: ConsoleConversionDefinition<TTarget>,
  options: ConversionOptions = {},
  onProgress?: ProgressCallback,
): Promise<ConversionResult> {
  const { mappings, paths } = definition;
  const report = createConversionReport(pack, definition.target, definition.ps3Version);
  const processed = new Set<string>();
  const overrides: OutputFile[] = [];

  progress(onProgress, 'reading', 5);
  const mediaPath = hudTargetMapping(definition.target, definition.ps3Version).mediaPath;
  const defaults = definition.preserveUnmodifiedMedia
    ? baseline.files
    : baseline.files.filter((file) => file.path !== mediaPath);
  progress(onProgress, 'mapping', 15);

  const items = mappedTextures(pack, 'item', mappings);
  const terrain = mappedTextures(pack, 'terrain', mappings);
  const individualParticles = mappedTextures(pack, 'particles', mappings).filter(
    (texture) => texture.canonicalId !== 'particles',
  );
  const directParticleNames = mappings.particles.directAtlas?.sourceNames ?? ['particles'];
  const particleDestination = mappings.particles.directAtlas?.destination ?? paths.particles;
  const fullParticleAtlas = texturesFor(pack, 'particles', mappings).find((texture) =>
    directParticleNames.includes(texture.canonicalId),
  );

  const [itemSizes, terrainSizes, particleSizes] = await Promise.all([
    inspectTextures(items),
    inspectTextures(terrain),
    inspectTextures(individualParticles),
  ]);
  const itemResolution = resolveItemResolution(
    itemSizes,
    report,
    mappings.items,
    options.itemResolution,
  );
  const blockResolution = resolveBlockResolution(terrainSizes, report);
  let particleResolution = resolveParticleResolution(particleSizes, mappings.particles);
  report.itemResolution = itemResolution;
  report.blockResolution = blockResolution;
  progress(onProgress, 'images', 28);

  const itemAtlas = await composeAtlas({
    base: baseline.atlases.items,
    mapping: mappings.items,
    textures: items,
    targetSlotSize: itemResolution,
    destination: paths.items,
    report,
    processed,
    resolveMapping: mappings.resolveAtlasMapping,
  });
  overrides.push({ path: paths.items, blob: itemAtlas });

  const terrainAtlas = await composeAtlas({
    base: baseline.atlases.terrain,
    mapping: mappings.terrain,
    textures: terrain,
    targetSlotSize: blockResolution,
    destination: paths.terrain,
    report,
    processed,
    resolveMapping: mappings.resolveAtlasMapping,
  });
  overrides.push({ path: paths.terrain, blob: terrainAtlas });
  progress(onProgress, 'atlas', 50);

  const terrainWidth =
    mappings.terrain.atlas.width * (blockResolution / mappings.terrain.atlas.slotSize);
  const terrainHeight =
    mappings.terrain.atlas.height * (blockResolution / mappings.terrain.atlas.slotSize);
  const terrainMipmaps = await generateMipmaps(
    terrainAtlas,
    terrainWidth,
    terrainHeight,
    paths.terrainMipmaps.length,
  );
  paths.terrainMipmaps.forEach((path, index) => {
    const blob = terrainMipmaps[index];
    if (blob) overrides.push({ path, blob });
  });
  progress(onProgress, 'mipmap', 62);

  let particleBase = baseline.atlases.particles;
  if (fullParticleAtlas) {
    processed.add(fullParticleAtlas.sourcePath);
    try {
      const size = await inspectImage(fullParticleAtlas.blob);
      const columns = mappings.particles.atlas.width / mappings.particles.atlas.slotSize;
      const rows = mappings.particles.atlas.height / mappings.particles.atlas.slotSize;
      if (size.width % columns !== 0 || size.height % rows !== 0) {
        throw new Error('invalid-particle-atlas');
      }
      const slotWidth = size.width / columns;
      const slotHeight = size.height / rows;
      if (slotWidth !== slotHeight) throw new Error('invalid-particle-atlas');
      particleBase = fullParticleAtlas.blob;
      particleResolution = slotWidth;
      addReportEntry(report, {
        sourcePath: fullParticleAtlas.sourcePath,
        canonicalId: 'particles',
        destination: particleDestination,
        status: 'converted',
        sourceResolution: `${size.width}x${size.height}`,
        outputResolution: `${size.width}x${size.height}`,
      });
    } catch {
      addReportEntry(report, {
        sourcePath: fullParticleAtlas.sourcePath,
        canonicalId: 'particles',
        destination: particleDestination,
        status: 'skipped',
      });
    }
  }

  const particlesAtlas = await composeAtlas({
    base: particleBase,
    mapping: mappings.particles,
    textures: individualParticles,
    targetSlotSize: particleResolution,
    destination: particleDestination,
    report,
    processed,
    resolveMapping: mappings.resolveAtlasMapping,
  });
  overrides.push({ path: particleDestination, blob: particlesAtlas });

  const specialTextures = pack.textures.filter((texture) =>
    mappings.resolveSpecialMapping(texture.canonicalId),
  );
  overrides.push(
    ...(await convertFileTextures(
      texturesFor(pack, 'armor', mappings),
      mappings.resolveArmorMapping,
      report,
      processed,
    )),
    ...(await convertFileTextures(
      texturesFor(pack, 'special', mappings),
      mappings.resolveGlintMapping,
      report,
      processed,
    )),
    ...(await convertSpecialTextures(
      specialTextures,
      report,
      processed,
      mappings.resolveSpecialMapping,
      definition.specialMipmapPath,
    )),
  );
  overrides.push(
    ...(await convertHudTextures(
      pack,
      baseline,
      definition.target,
      report,
      processed,
      definition.ps3Version,
    )),
  );
  // Raw GUI passthrough and HUD/FUI conversion intentionally may consume the
  // same source sheet. processed only prevents a final unsupported entry.
  overrides.push(
    ...convertGuiTextures(
      pack,
      { icons: paths.guiIcons, widgets: paths.guiWidgets },
      report,
      processed,
    ),
    ...(await convertSkyTexture(pack, paths.sky, report, processed)),
  );
  progress(onProgress, 'files', 80);

  for (const texture of pack.textures) {
    if (processed.has(texture.sourcePath)) continue;
    addReportEntry(report, {
      sourcePath: texture.sourcePath,
      canonicalId: texture.canonicalId,
      status: 'unsupported',
    });
  }

  const outputFiles = definition.buildFileTree(defaults, overrides);
  progress(onProgress, 'zip', 92);
  const zipBlob = await createOutputZip(outputFiles);
  progress(onProgress, 'zip', 100);

  return {
    zipBlob,
    downloadName: definition.createDownloadName(pack.name),
    report,
    outputFiles,
  };
}
