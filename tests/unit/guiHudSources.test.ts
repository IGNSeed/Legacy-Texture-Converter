import { describe, expect, it } from 'vitest';
import { parseBedrockPack } from '../../src/core/parsers/bedrock/parseBedrockPack';
import { parseJavaPack } from '../../src/core/parsers/java/parseJavaPack';
import type { VirtualFile } from '../../src/types/conversion';

function file(path: string): VirtualFile {
  return { path, name: path.split('/').at(-1) ?? path, blob: new Blob(['png']) };
}

describe('GUI HUD source discovery', () => {
  it('recognizes Java icons and widgets through normalized pack roots', async () => {
    const pack = await parseJavaPack('java', [
      file('Pack/assets/minecraft/textures/gui/icons.png'),
      file('Pack/assets/minecraft/textures/gui/widgets.png'),
    ]);
    expect(pack.textures.map(({ canonicalId, category }) => [canonicalId, category])).toEqual([
      ['icons', 'gui'],
      ['widgets', 'gui'],
    ]);
  });

  it('recognizes Bedrock icons and gui sheets independently', async () => {
    const pack = await parseBedrockPack('bedrock', [
      file('Pack/textures/gui/icons.png'),
      file('Pack/textures/gui/gui.png'),
    ]);
    expect(pack.textures.map(({ canonicalId, category }) => [canonicalId, category])).toEqual([
      ['icons', 'gui'],
      ['gui', 'gui'],
    ]);
  });

  it('accepts a single root-level GUI PNG after the user selects an edition', async () => {
    const pack = await parseJavaPack('icons.png', [file('icons.png')]);
    expect(pack.textures[0]).toMatchObject({ canonicalId: 'icons', category: 'gui' });
  });
});
