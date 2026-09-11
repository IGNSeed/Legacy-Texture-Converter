import { describe, expect, it } from 'vitest';
import { detectPackEdition } from '../../src/core/parsers/detectPackEdition';
import { classifyBedrockTexture } from '../../src/core/parsers/bedrock/parseBedrockPack';
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

  it('detects a Bedrock cubemap-only folder from its standard environment path', () => {
    expect(
      detectPackEdition([
        file('textures/environment/overworld_cubemap/cubemap_0.png'),
        file('textures/environment/overworld_cubemap/cubemap_1.png'),
      ]),
    ).toBe('bedrock');
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

  it('classifies only recognized Java and Bedrock GUI/Sky paths', () => {
    expect(classifyJavaTexture('assets/minecraft/textures/gui/widgets.png', 'widgets')).toBe('gui');
    expect(
      classifyJavaTexture(
        'Wrapped Pack\\Assets\\Minecraft\\Textures\\Gui\\Container\\Inventory.PNG',
        'inventory',
      ),
    ).toBe('gui');
    expect(classifyJavaTexture('assets/minecraft/optifine/sky/world0/sky1.png', 'sky1')).toBe(
      'sky',
    );
    expect(classifyJavaTexture('assets/minecraft/textures/entity/gui.png', 'gui')).toBe('unknown');
    expect(classifyBedrockTexture('textures/gui/gui.png', 'gui')).toBe('gui');
    expect(
      classifyBedrockTexture('assets/minecraft/textures/gui/container/inventory.png', 'inventory'),
    ).toBe('unknown');
    expect(
      classifyBedrockTexture('textures/environment/overworld_cubemap/cubemap_0.png', 'cubemap_0'),
    ).toBe('sky');
  });
});
