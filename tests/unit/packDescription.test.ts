import { describe, expect, it } from 'vitest';
import { createPackDescriptionFile } from '../../src/core/editions/common/createPackDescriptionFile';
import { parseBedrockPack } from '../../src/core/parsers/bedrock/parseBedrockPack';
import { parseJavaPack } from '../../src/core/parsers/java/parseJavaPack';
import type { VirtualFile } from '../../src/types/conversion';

function textFile(path: string, contents: string): VirtualFile {
  return {
    path,
    name: path.replaceAll('\\', '/').split('/').at(-1) ?? path,
    blob: new Blob([contents], { type: 'application/json' }),
  };
}

describe('Java pack descriptions', () => {
  it('reads a root string description', async () => {
    const pack = await parseJavaPack('Example.zip', [
      textFile(
        'pack.mcmeta',
        JSON.stringify({ pack: { pack_format: 1, description: 'by henrypacks' } }),
      ),
    ]);

    expect(pack.description).toBe('by henrypacks');
  });

  it('finds wrapped metadata with normalized path separators and preserves Unicode', async () => {
    const description = '§aテストパック\nSecond line';
    const pack = await parseJavaPack('ExamplePack', [
      textFile(
        'ExamplePack\\pack.mcmeta',
        JSON.stringify({ pack: { pack_format: 15, description } }),
      ),
      textFile('ExamplePack\\assets\\minecraft\\textures\\block\\stone.png', 'png'),
    ]);

    expect(pack.description).toBe(description);
  });

  it('flattens object and array text components without emitting style metadata', async () => {
    const objectPack = await parseJavaPack('Object.zip', [
      textFile(
        'pack.mcmeta',
        JSON.stringify({
          pack: {
            description: {
              text: 'My Pack',
              color: 'green',
              extra: [{ text: ' by Seed', bold: true }],
            },
          },
        }),
      ),
    ]);
    const arrayPack = await parseJavaPack('Array.zip', [
      textFile(
        'pack.mcmeta',
        JSON.stringify({ pack: { description: [{ text: 'Array' }, ' description'] } }),
      ),
    ]);

    expect(objectPack.description).toBe('My Pack by Seed');
    expect(arrayPack.description).toBe('Array description');
  });

  it('prefers metadata belonging to the actual nested texture root', async () => {
    const pack = await parseJavaPack('Combined.zip', [
      textFile('pack.mcmeta', JSON.stringify({ pack: { description: 'decoy' } })),
      textFile('ActualPack/pack.mcmeta', JSON.stringify({ pack: { description: 'actual pack' } })),
      textFile('ActualPack/assets/minecraft/textures/item/apple.png', 'png'),
    ]);

    expect(pack.description).toBe('actual pack');
  });
});

describe('Bedrock pack descriptions', () => {
  it('uses header.description and never a module description', async () => {
    const pack = await parseBedrockPack('Example.mcpack', [
      textFile(
        'manifest.json',
        JSON.stringify({
          header: { name: 'Example', description: '-Latenci' },
          modules: [{ description: 'ported by Seed', type: 'resources' }],
        }),
      ),
    ]);

    expect(pack.description).toBe('-Latenci');
    expect(pack.description).not.toBe('ported by Seed');
  });

  it('finds a manifest inside the pack root', async () => {
    const pack = await parseBedrockPack('ExamplePack', [
      textFile(
        'ExamplePack/manifest.json',
        JSON.stringify({ header: { description: 'Wrapped Bedrock pack' } }),
      ),
      textFile('ExamplePack/textures/blocks/stone.png', 'png'),
    ]);

    expect(pack.description).toBe('Wrapped Bedrock pack');
  });
});

describe('optional and malformed pack metadata', () => {
  it('does not fail or create descriptions for missing, invalid, absent, null, or blank values', async () => {
    const [javaMissing, javaInvalid, javaAbsent, javaNull, javaBlank] = await Promise.all([
      parseJavaPack('missing', []),
      parseJavaPack('invalid', [textFile('pack.mcmeta', '{broken')]),
      parseJavaPack('absent', [textFile('pack.mcmeta', JSON.stringify({ pack: {} }))]),
      parseJavaPack('null', [
        textFile('pack.mcmeta', JSON.stringify({ pack: { description: null } })),
      ]),
      parseJavaPack('blank', [
        textFile('pack.mcmeta', JSON.stringify({ pack: { description: ' \n\t ' } })),
      ]),
    ]);
    const [bedrockMissing, bedrockInvalid, bedrockAbsent, bedrockNull, bedrockBlank] =
      await Promise.all([
        parseBedrockPack('missing', []),
        parseBedrockPack('invalid', [textFile('manifest.json', '{broken')]),
        parseBedrockPack('absent', [textFile('manifest.json', JSON.stringify({ header: {} }))]),
        parseBedrockPack('null', [
          textFile('manifest.json', JSON.stringify({ header: { description: null } })),
        ]),
        parseBedrockPack('blank', [
          textFile('manifest.json', JSON.stringify({ header: { description: ' \n\t ' } })),
        ]),
      ]);

    const packs = [
      javaMissing,
      javaInvalid,
      javaAbsent,
      javaNull,
      javaBlank,
      bedrockMissing,
      bedrockInvalid,
      bedrockAbsent,
      bedrockNull,
      bedrockBlank,
    ];
    for (const pack of packs) expect(pack.description).toBeUndefined();
  });

  it('creates exact UTF-8 bytes without a BOM or trimming and skips blank overrides', async () => {
    const description = '  §a説明文\nLine 2  ';
    const output = createPackDescriptionFile(description, 'Common/res/description.txt');

    expect(output?.path).toBe('Common/res/description.txt');
    expect(output?.blob.type).toBe('text/plain;charset=utf-8');
    expect(Array.from(new Uint8Array(await output!.blob.arrayBuffer()))).toEqual(
      Array.from(new TextEncoder().encode(description)),
    );
    expect(createPackDescriptionFile(undefined, 'Common/res/description.txt')).toBeUndefined();
    expect(createPackDescriptionFile(' \n\t ', 'Common/res/description.txt')).toBeUndefined();
  });
});
