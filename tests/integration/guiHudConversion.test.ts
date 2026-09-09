import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findArcEntry, getArcEntryData, parseArc } from '../../src/core/binary/arc';
import { findFuiImage, parseFui } from '../../src/core/binary/fui';
import { findSwfBitmap, parseSwf } from '../../src/core/binary/swf';
import { createPs3BaseAssetSet } from '../../src/core/editions/ps3/base-assets';
import { convertPs3Pack } from '../../src/core/editions/ps3/convertPs3Pack';
import { PS3_PATHS } from '../../src/core/editions/ps3/paths';
import { createSwitchBaseAssetSet } from '../../src/core/editions/switch/base-assets';
import { convertSwitchPack } from '../../src/core/editions/switch/convertSwitchPack';
import { SWITCH_ATMOSPHERE_PREFIX, SWITCH_PATHS } from '../../src/core/editions/switch/paths';
import { createWiiUBaseAssetSet } from '../../src/core/editions/wiiu/base-assets';
import { convertWiiUPack } from '../../src/core/editions/wiiu/convertWiiUPack';
import { WIIU_PATHS } from '../../src/core/editions/wiiu/paths';
import { hudTargetMapping } from '../../src/core/gui-hud/mappings';
import { readZipPack } from '../../src/core/files/readZipPack';
import type { ParsedPack, ParsedTexture } from '../../src/types/conversion';
import { completeSwitchBaseFiles } from '../helpers/switchBaseAssets';
import { completeWiiUBaseFiles } from '../helpers/wiiuBaseAssets';
import { syntheticPngBytes } from '../helpers/mediaArchive';

function fakeCanvas(): HTMLCanvasElement {
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({
      imageSmoothingEnabled: true,
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn((_x: number, _y: number, width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
      })),
      createImageData: vi.fn((width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
      })),
      putImageData: vi.fn(),
    })),
    toBlob: vi.fn((callback: BlobCallback) => {
      const bytes = syntheticPngBytes(canvas.width, canvas.height, 5);
      callback(new Blob([bytes.buffer as ArrayBuffer]));
    }),
  };
  return canvas as unknown as HTMLCanvasElement;
}

async function pngDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function guiTexture(path: string, canonicalId: string, size: number): ParsedTexture {
  const bytes = syntheticPngBytes(size, size);
  return {
    sourcePath: path,
    canonicalId,
    category: 'gui',
    blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'image/png' }),
  };
}

function pack(
  edition: ParsedPack['edition'],
  iconSize: number,
  includeSecondSheet = true,
): ParsedPack {
  const second = edition === 'java' ? 'widgets' : 'gui';
  return {
    name: `${edition}-hud.zip`,
    edition,
    files: [],
    textures: [
      guiTexture(`textures/gui/icons.png`, 'icons', iconSize),
      ...(includeSecondSheet ? [guiTexture(`textures/gui/${second}.png`, second, iconSize)] : []),
    ],
  };
}

beforeEach(() => {
  vi.spyOn(document, 'createElement').mockImplementation(() => fakeCanvas());
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async (blob: Blob) => ({ ...(await pngDimensions(blob)), close: vi.fn() })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('GUI HUD end-to-end conversion', () => {
  for (const version of ['latest', '1.8'] as const) {
    for (const sourceEdition of ['java', 'bedrock'] as const) {
      it(`rebuilds PS3 ${version} from ${sourceEdition} through its version-specific HUD backend`, async () => {
        const bytes = await readFile(`public/assets/ps3/${version}/ps3-${version}-base-assets.zip`);
        const files = await readZipPack(new Blob([bytes]));
        const baseline = await createPs3BaseAssetSet(`PS3 ${version}`, files, version);
        if (!baseline.assetSet) throw new Error('test PS3 baseline missing');
        const input = pack(sourceEdition, 256);
        const result = await convertPs3Pack(input, baseline.assetSet, version);
        const output = result.outputFiles.find((file) => file.path === PS3_PATHS.media);
        expect(output).toBeDefined();
        expect(result.report).toMatchObject({ outputEdition: 'ps3', ps3Version: version });
        expect(result.downloadName).toBe(
          `${sourceEdition}-hud_PS3_${version === 'latest' ? 'Latest' : '1.8'}.zip`,
        );
        expect(result.outputFiles.every((file) => file.path.startsWith('Common/'))).toBe(true);
        expect(result.outputFiles.some((file) => file.path === PS3_PATHS.guiIcons)).toBe(true);
        expect(result.outputFiles.some((file) => file.path === PS3_PATHS.guiWidgets)).toBe(true);
        const zippedFiles = await readZipPack(result.zipBlob);
        expect(zippedFiles.some((file) => file.path === PS3_PATHS.media)).toBe(true);

        const archive = parseArc(new Uint8Array(await output!.blob.arrayBuffer()));
        const mapping = hudTargetMapping('ps3', version);
        if (mapping.backend === 'fui') {
          const target = mapping.fuis[0];
          const fui = parseFui(getArcEntryData(archive, findArcEntry(archive, target.name)!));
          expect(fui.images).toHaveLength(target.imageCount);
        } else {
          const target = mapping.swfs[0];
          const swf = await parseSwf(getArcEntryData(archive, findArcEntry(archive, target.name)!));
          expect(swf.signature).toBe('CWS');
          expect(findSwfBitmap(swf, target.entries[0].bitmapId)).toBeDefined();
        }
      });
    }
  }

  it('preserves the original PS3 Media archive when SWF conversion validation fails', async () => {
    const bytes = await readFile('public/assets/ps3/1.8/ps3-1.8-base-assets.zip');
    const files = await readZipPack(new Blob([bytes]));
    const baseline = await createPs3BaseAssetSet('PS3 1.8', files, '1.8');
    if (!baseline.assetSet) throw new Error('test PS3 baseline missing');
    const originalMedia = baseline.assetSet.files.find((file) => file.path === PS3_PATHS.media);
    if (!originalMedia) throw new Error('test PS3 Media missing');
    const brokenMedia = new Map(baseline.assetSet.byPath);
    brokenMedia.set(PS3_PATHS.media, new Blob([new Uint8Array([1, 2, 3])]));

    const result = await convertPs3Pack(
      pack('java', 256),
      { ...baseline.assetSet, byPath: brokenMedia },
      '1.8',
    );
    const output = result.outputFiles.find((file) => file.path === PS3_PATHS.media);
    expect(output?.blob).toBe(originalMedia.blob);
    expect(result.report.warnings).toContainEqual(
      expect.objectContaining({
        code: 'gui-arc-validation',
        messageKey: 'warnings.ps3GuiArcValidation',
      }),
    );
  });

  it('rebuilds the Wii U FUI and Media ARC from a 256px Java HUD', async () => {
    const baseline = await createWiiUBaseAssetSet('test', completeWiiUBaseFiles());
    if (!baseline.assetSet) throw new Error('test baseline missing');
    const input = pack('java', 256);
    const result = await convertWiiUPack(input, baseline.assetSet);
    const output = result.outputFiles.find((file) => file.path === WIIU_PATHS.media);
    expect(output).toBeDefined();
    expect(result.report.converted).toBe(20);
    expect(result.report.resized).toBe(0);

    const rawIcons = result.outputFiles.find((file) => file.path === WIIU_PATHS.guiIcons);
    const rawWidgets = result.outputFiles.find((file) => file.path === WIIU_PATHS.guiWidgets);
    expect(rawIcons?.blob).toBe(input.textures[0]?.blob);
    expect(rawWidgets?.blob).toBe(input.textures[1]?.blob);

    const archive = parseArc(new Uint8Array(await output!.blob.arrayBuffer()));
    const target = hudTargetMapping('wiiu').fuis[0];
    const entry = findArcEntry(archive, target.name);
    const fui = parseFui(getArcEntryData(archive, entry!));
    expect(fui.images).toHaveLength(target.imageCount);
    expect(findFuiImage(fui, 46)).toMatchObject({ width: 15, height: 15 });
  });

  it('independently rebuilds both Switch FUI files from one 512px Bedrock HUD', async () => {
    const baseline = await createSwitchBaseAssetSet('test', completeSwitchBaseFiles());
    if (!baseline.assetSet) throw new Error('test baseline missing');
    const result = await convertSwitchPack(pack('bedrock', 512), baseline.assetSet);
    const outputPath = `${SWITCH_ATMOSPHERE_PREFIX}/${SWITCH_PATHS.media}`;
    const output = result.outputFiles.find((file) => file.path === outputPath);
    expect(output).toBeDefined();
    expect(result.report.resized).toBe(36);
    expect(
      result.outputFiles.some(
        (file) => file.path === `${SWITCH_ATMOSPHERE_PREFIX}/${SWITCH_PATHS.guiWidgets}`,
      ),
    ).toBe(true);
    expect(
      result.report.entries.some((entry) => entry.destination?.includes('skinGraphicsHud')),
    ).toBe(true);
    expect(
      result.report.entries.some((entry) => entry.destination?.includes('skinHDGraphicsHud')),
    ).toBe(true);

    const archive = parseArc(new Uint8Array(await output!.blob.arrayBuffer()));
    for (const target of hudTargetMapping('switch').fuis) {
      const entry = findArcEntry(archive, target.name);
      const fui = parseFui(getArcEntryData(archive, entry!));
      expect(fui.images).toHaveLength(target.imageCount);
      expect(findFuiImage(fui, 44)).toMatchObject({ width: 182, height: 22 });
    }
  });

  it('converts an available sheet and reports the missing sheet as vanilla-preserved', async () => {
    const baseline = await createWiiUBaseAssetSet('test', completeWiiUBaseFiles());
    if (!baseline.assetSet) throw new Error('test baseline missing');
    const result = await convertWiiUPack(pack('java', 1024, false), baseline.assetSet);

    expect(result.outputFiles.some((file) => file.path === WIIU_PATHS.media)).toBe(true);
    expect(result.report.resized).toBe(16);
    expect(result.report.preserved).toBe(1);
    expect(result.report.entries).toContainEqual(
      expect.objectContaining({
        canonicalId: 'hud.sheet.widgets',
        status: 'preserved',
        messageKey: 'messages.guiSheetMissing',
      }),
    );
  });

  it('skips only an unsupported GUI sheet size and omits the unchanged Media ARC', async () => {
    const baseline = await createWiiUBaseAssetSet('test', completeWiiUBaseFiles());
    if (!baseline.assetSet) throw new Error('test baseline missing');
    const result = await convertWiiUPack(pack('java', 300, false), baseline.assetSet);

    expect(result.outputFiles.some((file) => file.path === WIIU_PATHS.media)).toBe(false);
    expect(result.report.skipped).toBe(1);
    expect(result.report.warnings).toContainEqual(
      expect.objectContaining({ code: 'gui-sheet-dimensions' }),
    );
  });
});
