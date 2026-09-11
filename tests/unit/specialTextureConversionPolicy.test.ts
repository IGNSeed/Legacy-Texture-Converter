import { afterEach, describe, expect, it, vi } from 'vitest';
import { convertSpecialTextures } from '../../src/core/convert/convertSpecialTextures';
import { createConversionReport } from '../../src/core/report/createConversionReport';
import { ps3LatestMappings, ps3OneEightMappings } from '../../src/core/mappings/ps3Mappings';
import { switchMappings } from '../../src/core/mappings/switchMappings';
import { wiiuMappings } from '../../src/core/mappings/wiiuMappings';
import type { ParsedPack, ParsedTexture } from '../../src/types/conversion';

const editions = [
  ['Wii U', wiiuMappings],
  ['Switch', switchMappings],
  ['PS3 Latest', ps3LatestMappings],
  ['PS3 1.8', ps3OneEightMappings],
] as const;

const fluidAliases = [
  'water',
  'water_still',
  'water_flow',
  'flowing_water',
  'lava',
  'lava_still',
  'lava_flow',
  'flowing_lava',
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('input fluid conversion policy', () => {
  it.each(editions)(
    'marks every known water and lava alias as preserve-base for %s',
    (_, mappings) => {
      for (const id of fluidAliases) {
        expect(mappings.resolveSpecialMapping(id)).toMatchObject({ inputPolicy: 'preserve-base' });
      }
    },
  );

  it('also preserves mapped cauldron water instead of treating it as an unrelated special texture', () => {
    expect(switchMappings.resolveSpecialMapping('cauldron_water')).toMatchObject({
      inputPolicy: 'preserve-base',
    });
    expect(ps3LatestMappings.resolveSpecialMapping('cauldron_water')).toMatchObject({
      inputPolicy: 'preserve-base',
    });
  });

  it('skips input water before image decoding while still converting fire', async () => {
    const inputWater = new Blob(['not-even-a-png']);
    const inputFire = new Blob(['fire-png']);
    const textures: ParsedTexture[] = [
      {
        sourcePath: 'assets/minecraft/textures/block/water_still.png',
        canonicalId: 'water_still',
        category: 'special',
        blob: inputWater,
        animationMetadata: '{invalid-water-animation}',
      },
      {
        sourcePath: 'assets/minecraft/textures/block/fire_0.png',
        canonicalId: 'fire_0',
        category: 'special',
        blob: inputFire,
      },
    ];
    const pack: ParsedPack = { name: 'java.zip', edition: 'java', files: [], textures };
    const report = createConversionReport(pack);
    const processed = new Set<string>();
    const decode = vi.fn((blob: Blob) => {
      if (blob === inputWater) throw new Error('water must not be decoded');
      return Promise.resolve({ width: 16, height: 512, close: vi.fn() });
    });
    vi.stubGlobal('createImageBitmap', decode);

    const output = await convertSpecialTextures(
      textures,
      report,
      processed,
      switchMappings.resolveSpecialMapping,
      (destination, level) => destination.replace('.png', `.mip${level}.png`),
    );

    expect(output).toEqual([
      {
        path: 'Common/res/TitleUpdate/res/textures/blocks/fire_0.png',
        blob: inputFire,
      },
    ]);
    expect(decode).toHaveBeenCalledTimes(1);
    expect(decode).toHaveBeenCalledWith(inputFire);
    expect(processed).toEqual(new Set(textures.map((texture) => texture.sourcePath)));
    expect(report.entries).toContainEqual({
      sourcePath: textures[0].sourcePath,
      canonicalId: 'water',
      destination: 'Common/res/TitleUpdate/res/textures/blocks/water.png',
      status: 'skipped',
      messageKey: 'messages.inputFluidIgnored',
    });
    expect(report.entries).toContainEqual(
      expect.objectContaining({ canonicalId: 'fire_0', status: 'converted' }),
    );
  });
});
