import type {
  ConversionResult,
  OutputFile,
  ParsedPack,
  ParsedTexture,
  ProgressCallback,
} from '../../../types/conversion';
import { composeAtlas } from '../../atlas/composeAtlas';
import { convertFileTextures } from '../../convert/convertFileTextures';
import { convertSpecialTextures } from '../../convert/convertSpecialTextures';
import { createWiiUDownloadName } from '../../files/sanitizeFileName';
import { inspectImage } from '../../image/decodeImage';
import { generateMipmaps } from '../../mipmap/generateMipmaps';
import {
  itemMappings,
  particleMappings,
  resolveArmorMapping,
  resolveAtlasMapping,
  resolveGlintMapping,
  resolveWiiUCategory,
  terrainMappings,
} from '../../mappings/wiiuMappings';
import { buildWiiUFileTree } from '../../packaging/buildWiiUFileTree';
import { createOutputZip } from '../../packaging/createOutputZip';
import { addReportEntry, createConversionReport } from '../../report/createConversionReport';
import {
  inspectTextures,
  resolveBlockResolution,
  resolveItemResolution,
  resolveParticleResolution,
} from '../../validation/resolution';
import { WIIU_PATHS } from './paths';

function progress(
  onProgress: ProgressCallback | undefined,
  stage: Parameters<ProgressCallback>[0]['stage'],
  percent: number,
): void {
  onProgress?.({ stage, percent });
}

function findBlob(files: readonly OutputFile[], path: string): Blob {
  const blob = files.find((file) => file.path === path)?.blob;
  if (!blob) throw new Error(`missing-default-asset:${path}`);
  return blob;
}

function mappedTextures(pack: ParsedPack, category: ParsedTexture['category']): ParsedTexture[] {
  return pack.textures.filter(
    (texture) =>
      (texture.category === category ||
        (texture.category === 'unknown' &&
          resolveWiiUCategory(texture.canonicalId) === category)) &&
      resolveAtlasMapping(category, texture.canonicalId),
  );
}

function texturesFor(pack: ParsedPack, category: ParsedTexture['category']): ParsedTexture[] {
  return pack.textures.filter(
    (texture) =>
      texture.category === category ||
      (texture.category === 'unknown' && resolveWiiUCategory(texture.canonicalId) === category),
  );
}

export async function convertWiiUPack(
  pack: ParsedPack,
  baseline: readonly OutputFile[],
  onProgress?: ProgressCallback,
): Promise<ConversionResult> {
  const report = createConversionReport(pack);
  const processed = new Set<string>();
  const overrides: OutputFile[] = [];

  progress(onProgress, 'reading', 5);
  const defaults = [...baseline];
  progress(onProgress, 'mapping', 15);

  const items = mappedTextures(pack, 'item');
  const terrain = mappedTextures(pack, 'terrain');
  const individualParticles = mappedTextures(pack, 'particles').filter(
    (texture) => texture.canonicalId !== 'particles',
  );
  const directParticleNames = particleMappings.directAtlas?.sourceNames ?? ['particles'];
  const particleDestination = particleMappings.directAtlas?.destination ?? WIIU_PATHS.particles;
  const fullParticleAtlas = texturesFor(pack, 'particles').find((texture) =>
    directParticleNames.includes(texture.canonicalId),
  );

  const [itemSizes, terrainSizes, particleSizes] = await Promise.all([
    inspectTextures(items),
    inspectTextures(terrain),
    inspectTextures(individualParticles),
  ]);
  const itemResolution = resolveItemResolution(itemSizes, report);
  const blockResolution = resolveBlockResolution(terrainSizes, report);
  let particleResolution = resolveParticleResolution(particleSizes);
  report.itemResolution = itemResolution;
  report.blockResolution = blockResolution;
  progress(onProgress, 'images', 28);

  const itemAtlas = await composeAtlas({
    base: findBlob(defaults, WIIU_PATHS.items),
    mapping: itemMappings,
    textures: items,
    targetSlotSize: itemResolution,
    destination: WIIU_PATHS.items,
    report,
    processed,
  });
  overrides.push({ path: WIIU_PATHS.items, blob: itemAtlas });

  const terrainAtlas = await composeAtlas({
    base: findBlob(defaults, WIIU_PATHS.terrain),
    mapping: terrainMappings,
    textures: terrain,
    targetSlotSize: blockResolution,
    destination: WIIU_PATHS.terrain,
    report,
    processed,
  });
  overrides.push({ path: WIIU_PATHS.terrain, blob: terrainAtlas });
  progress(onProgress, 'atlas', 50);

  const terrainWidth =
    terrainMappings.atlas.width * (blockResolution / terrainMappings.atlas.slotSize);
  const terrainHeight =
    terrainMappings.atlas.height * (blockResolution / terrainMappings.atlas.slotSize);
  const [terrainMip2, terrainMip3] = await generateMipmaps(
    terrainAtlas,
    terrainWidth,
    terrainHeight,
    2,
  );
  overrides.push(
    { path: WIIU_PATHS.terrainMip2, blob: terrainMip2 },
    { path: WIIU_PATHS.terrainMip3, blob: terrainMip3 },
  );
  progress(onProgress, 'mipmap', 62);

  let particleBase = findBlob(defaults, WIIU_PATHS.particles);
  if (fullParticleAtlas) {
    processed.add(fullParticleAtlas.sourcePath);
    try {
      const size = await inspectImage(fullParticleAtlas.blob);
      if (size.width !== size.height || size.width % 16 !== 0)
        throw new Error('invalid-particle-atlas');
      particleBase = fullParticleAtlas.blob;
      particleResolution = size.width / 16;
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
    mapping: particleMappings,
    textures: individualParticles,
    targetSlotSize: particleResolution,
    destination: particleDestination,
    report,
    processed,
  });
  overrides.push({ path: particleDestination, blob: particlesAtlas });

  overrides.push(
    ...(await convertFileTextures(
      texturesFor(pack, 'armor'),
      resolveArmorMapping,
      report,
      processed,
    )),
    ...(await convertFileTextures(
      texturesFor(pack, 'special'),
      resolveGlintMapping,
      report,
      processed,
    )),
    ...(await convertSpecialTextures(texturesFor(pack, 'special'), report, processed)),
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

  const outputFiles = buildWiiUFileTree(defaults, overrides);
  progress(onProgress, 'zip', 92);
  const zipBlob = await createOutputZip(outputFiles);
  progress(onProgress, 'zip', 100);

  return {
    zipBlob,
    downloadName: createWiiUDownloadName(pack.name),
    report,
    outputFiles,
  };
}
