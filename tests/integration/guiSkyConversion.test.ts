import JSZip from 'jszip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSwitchBaseAssetSet } from '../../src/core/editions/switch/base-assets';
import { convertSwitchPack } from '../../src/core/editions/switch/convertSwitchPack';
import { SWITCH_ATMOSPHERE_PREFIX, SWITCH_PATHS } from '../../src/core/editions/switch/paths';
import { createWiiUBaseAssetSet } from '../../src/core/editions/wiiu/base-assets';
import { convertWiiUPack } from '../../src/core/editions/wiiu/convertWiiUPack';
import { WIIU_PATHS } from '../../src/core/editions/wiiu/paths';
import { LCE_SKY_HEIGHT, LCE_SKY_WIDTH } from '../../src/core/sky/renderSkyTexture';
import type { ParsedPack, ParsedTexture } from '../../src/types/conversion';
import { pngBlob } from '../helpers/png';
import { completeSwitchBaseFiles } from '../helpers/switchBaseAssets';
import { completeWiiUBaseFiles } from '../helpers/wiiuBaseAssets';

function pngDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return blob.arrayBuffer().then((buffer) => {
    const view = new DataView(buffer);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  });
}

function fakeCanvas(): HTMLCanvasElement {
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
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
    toBlob: vi.fn((callback: BlobCallback) => callback(pngBlob(canvas.width, canvas.height))),
  };
  return canvas as unknown as HTMLCanvasElement;
}

function texture(
  path: string,
  category: ParsedTexture['category'],
  width: number,
  height: number,
  marker: string,
): ParsedTexture {
  return {
    sourcePath: path,
    canonicalId:
      path
        .split('/')
        .at(-1)
        ?.replace(/\.png$/i, '') ?? '',
    category,
    blob: pngBlob(width, height, marker),
  };
}

async function bytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
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

describe('GUI passthrough and Sky target packaging', () => {
  it('emits byte-identical Java GUI textures and a 4032x2688 Sky at Wii U paths', async () => {
    const icons = texture('assets/minecraft/textures/gui/icons.png', 'gui', 17, 17, 'java-icons');
    const widgets = texture(
      'assets/minecraft/textures/gui/widgets.png',
      'gui',
      17,
      17,
      'java-widgets',
    );
    const sky = texture('assets/minecraft/optifine/sky/world0/sky1.png', 'sky', 6, 4, 'java-sky');
    const input: ParsedPack = {
      name: 'java-gui-sky.zip',
      edition: 'java',
      files: [],
      textures: [icons, widgets, sky],
    };
    const baseline = await createWiiUBaseAssetSet('test', completeWiiUBaseFiles());
    if (!baseline.assetSet) throw new Error('test Wii U baseline missing');

    const result = await convertWiiUPack(input, baseline.assetSet);
    const outputIcons = result.outputFiles.find((file) => file.path === WIIU_PATHS.guiIcons);
    const outputWidgets = result.outputFiles.find((file) => file.path === WIIU_PATHS.guiWidgets);
    const outputSky = result.outputFiles.find((file) => file.path === WIIU_PATHS.sky);

    expect(await bytes(outputIcons!.blob)).toEqual(await bytes(icons.blob));
    expect(await bytes(outputWidgets!.blob)).toEqual(await bytes(widgets.blob));
    expect(await pngDimensions(outputSky!.blob)).toEqual({
      width: LCE_SKY_WIDTH,
      height: LCE_SKY_HEIGHT,
    });
    const archive = await JSZip.loadAsync(result.zipBlob);
    expect(await archive.file(WIIU_PATHS.guiIcons)?.async('uint8array')).toEqual(
      await bytes(icons.blob),
    );
    expect(archive.file(WIIU_PATHS.guiWidgets)).not.toBeNull();
    expect(archive.file(WIIU_PATHS.sky)).not.toBeNull();
  });

  it('emits Bedrock gui.png and cubemap output beneath the Switch Atmosphere prefix', async () => {
    const gui = texture('textures/gui/gui.png', 'gui', 17, 17, 'bedrock-gui');
    const cubemaps = Array.from({ length: 6 }, (_, index) =>
      texture(
        `textures/environment/overworld_cubemap/cubemap_${index}.png`,
        'sky',
        2,
        2,
        `face-${index}`,
      ),
    );
    const input: ParsedPack = {
      name: 'bedrock-gui-sky.mcpack',
      edition: 'bedrock',
      files: [],
      textures: [gui, ...cubemaps],
    };
    const baseline = await createSwitchBaseAssetSet('test', completeSwitchBaseFiles());
    if (!baseline.assetSet) throw new Error('test Switch baseline missing');

    const result = await convertSwitchPack(input, baseline.assetSet);
    const widgetsPath = `${SWITCH_ATMOSPHERE_PREFIX}/${SWITCH_PATHS.guiWidgets}`;
    const skyPath = `${SWITCH_ATMOSPHERE_PREFIX}/${SWITCH_PATHS.sky}`;
    const outputWidgets = result.outputFiles.find((file) => file.path === widgetsPath);
    const outputSky = result.outputFiles.find((file) => file.path === skyPath);

    expect(await bytes(outputWidgets!.blob)).toEqual(await bytes(gui.blob));
    expect(await pngDimensions(outputSky!.blob)).toEqual({
      width: LCE_SKY_WIDTH,
      height: LCE_SKY_HEIGHT,
    });
    expect(result.outputFiles.every((file) => file.path.startsWith('atmosphere/'))).toBe(true);
    const archive = await JSZip.loadAsync(result.zipBlob);
    expect(await archive.file(widgetsPath)?.async('uint8array')).toEqual(await bytes(gui.blob));
    expect(archive.file(skyPath)).not.toBeNull();
  });
});
