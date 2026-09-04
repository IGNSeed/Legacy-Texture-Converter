import { describe, expect, it } from 'vitest';
import { detectPackEdition } from '../../src/core/parsers/detectPackEdition';
import { classifyJavaTexture } from '../../src/core/parsers/java/parseJavaPack';
import { parsePack } from '../../src/core/parsers/parsePack';
import type { VirtualFile } from '../../src/types/conversion';

const file = (path: string): VirtualFile => ({
  path,
  name: path.split('/').at(-1)!,
  blob: new Blob(),
});

describe('pack edition detection', () => {
  it('detects Java packs', () => {
    expect(
      detectPackEdition([file('pack.mcmeta'), file('assets/minecraft/textures/item/apple.png')]),
    ).toBe('java');
  });

  it('detects Bedrock packs', () => {
    expect(detectPackEdition([file('manifest.json'), file('textures/items/apple.png')])).toBe(
      'bedrock',
    );
  });

  it('leaves individual ambiguous PNG files for manual selection', () => {
    expect(detectPackEdition([file('stone.png')])).toBe('unknown');
  });

  it('keeps a manually classified individual PNG available to Wii U mapping', async () => {
    const pack = await parsePack('stone.png', [file('stone.png')], 'java');
    expect(pack.textures).toMatchObject([{ canonicalId: 'stone', category: 'unknown' }]);
  });

  it('classifies modern Java equipment textures as armor', () => {
    const path = 'assets/minecraft/textures/entity/equipment/humanoid/diamond.png';
    expect(classifyJavaTexture(path, 'diamond_layer_1')).toBe('armor');
  });
});
