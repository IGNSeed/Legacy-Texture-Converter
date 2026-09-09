import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createSwitchBaseAssetSet,
  SWITCH_BASE_ASSET_PATHS,
} from '../../src/core/editions/switch/base-assets';
import { convertSwitchPack } from '../../src/core/editions/switch/convertSwitchPack';
import { SWITCH_ATMOSPHERE_PREFIX, SWITCH_TITLE_ID } from '../../src/core/editions/switch/paths';
import { readZipPack } from '../../src/core/files/readZipPack';
import { parsePack } from '../../src/core/parsers/parsePack';
import type { SourceEdition } from '../../src/types/conversion';
import { completeSwitchBaseFiles } from '../helpers/switchBaseAssets';

function fakeCanvas(): HTMLCanvasElement {
  const context = {
    imageSmoothingEnabled: true,
    clearRect: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' }))),
  } as unknown as HTMLCanvasElement;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each<Exclude<SourceEdition, 'unknown'>>(['java', 'bedrock'])(
  'complete Switch conversion pipeline for %s input',
  (edition) => {
    it('creates an Atmosphère-ready 1.0.17 ZIP and reports unsupported textures', async () => {
      vi.spyOn(document, 'createElement').mockImplementation(() => fakeCanvas());
      vi.stubGlobal(
        'createImageBitmap',
        vi.fn(async (blob: Blob) => {
          const marker = await blob.text();
          const size = marker.includes('stone')
            ? { width: 64, height: 64 }
            : marker.includes('diamond_sword')
              ? { width: 32, height: 32 }
              : marker.includes('iron')
                ? { width: 64, height: 32 }
                : marker.includes('fire') || marker.includes('water')
                  ? { width: 16, height: 512 }
                  : { width: 16, height: 16 };
          return {
            ...size,
            close: vi.fn(),
          };
        }),
      );
      const loadedBaseline = await createSwitchBaseAssetSet(
        'test Switch 1.0.17',
        completeSwitchBaseFiles(),
      );
      if (!loadedBaseline.assetSet) throw new Error('test Switch baseline was not created');

      const inputArchive = new JSZip();
      if (edition === 'java') {
        inputArchive.file('pack.mcmeta', '{}');
        inputArchive.file(
          'assets/minecraft/textures/items/diamond_sword.png',
          new Blob(['diamond_sword']),
        );
        inputArchive.file('assets/minecraft/textures/blocks/stone.png', new Blob(['stone']));
        inputArchive.file(
          'assets/minecraft/textures/models/armor/iron_layer_1.png',
          new Blob(['iron']),
        );
        inputArchive.file('assets/minecraft/textures/blocks/fire_layer_0.png', new Blob(['fire']));
        inputArchive.file(
          'assets/minecraft/textures/blocks/fire_layer_0.png.mcmeta',
          JSON.stringify({ animation: { frametime: 2, frames: [0, 1] } }),
        );
        inputArchive.file('assets/minecraft/textures/blocks/water_still.png', new Blob(['water']));
        inputArchive.file('assets/minecraft/textures/items/trident.png', new Blob(['trident']));
      } else {
        inputArchive.file('manifest.json', '{}');
        inputArchive.file('textures/items/diamond_sword.png', new Blob(['diamond_sword']));
        inputArchive.file('textures/blocks/stone.png', new Blob(['stone']));
        inputArchive.file('textures/models/armor/iron_1.png', new Blob(['iron']));
        inputArchive.file('textures/blocks/fire_0.png', new Blob(['fire']));
        inputArchive.file('textures/blocks/water_still.png', new Blob(['water']));
        inputArchive.file('textures/items/trident.png', new Blob(['trident']));
        inputArchive.file(
          'textures/flipbook_textures.json',
          JSON.stringify([
            {
              flipbook_texture: 'textures/blocks/fire_0',
              ticks_per_frame: 2,
            },
          ]),
        );
      }
      const inputFiles = await readZipPack(await inputArchive.generateAsync({ type: 'blob' }));
      const pack = await parsePack(`${edition}-example.zip`, inputFiles, edition);
      const result = await convertSwitchPack(pack, loadedBaseline.assetSet, {
        itemResolution: 64,
      });

      expect(result.downloadName).toBe(`${edition}-example_Switch_1.0.17.zip`);
      expect(result.report).toMatchObject({
        inputEdition: edition,
        outputEdition: 'switch',
        itemResolution: 64,
        blockResolution: 32,
        unsupported: 1,
      });
      const archive = await JSZip.loadAsync(result.zipBlob);
      const paths = Object.keys(archive.files);
      const expectedRoot = `atmosphere/contents/${SWITCH_TITLE_ID}/romfs/`;
      expect(`${SWITCH_ATMOSPHERE_PREFIX}/`).toBe(expectedRoot);
      expect(paths).toContain(`${expectedRoot}Common/res/TitleUpdate/res/items.png`);
      expect(paths).toContain(`${expectedRoot}Common/res/TitleUpdate/res/terrainMipMapLevel3.png`);
      expect(paths).toContain(`${expectedRoot}Common/res/1_2_2/armor/iron_1.png`);
      expect(paths).toContain(`${expectedRoot}Common/res/1_2_2/armor/diamond_2.png`);
      expect(paths).toContain(`${expectedRoot}Common/res/TitleUpdate/res/particles.png`);
      expect(paths).not.toContain(`${expectedRoot}Common/Media/MediaNX.arc`);
      expect(paths).toContain(
        `${expectedRoot}Common/res/TitleUpdate/res/textures/blocks/waterMipMapLevel5.png`,
      );
      expect(
        paths.some((path) => path.endsWith('/textures/blocks/water_flowMipMapLevel2.png')),
      ).toBe(false);
      expect(paths.every((path) => path.startsWith('atmosphere/'))).toBe(true);
      expect(
        paths.every(
          (path) =>
            !/(?:^|\/)(?:References|switch|LegacyTextureConverter|BASE|UPD)(?:\/|$)/i.test(path),
        ),
      ).toBe(true);
      // The large optional Media ARC baseline is emitted only when a GUI HUD sheet was converted.
      expect(result.outputFiles.length).toBe(SWITCH_BASE_ASSET_PATHS.length + 1);
      const animationText = await archive
        .file(`${expectedRoot}Common/res/TitleUpdate/res/textures/blocks/fire_0.txt`)
        ?.async('text');
      expect(animationText).toMatch(/^0\*2\n1\*2\n/);
    });
  },
);
