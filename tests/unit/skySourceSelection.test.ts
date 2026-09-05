import { describe, expect, it } from 'vitest';
import {
  bedrockCubemapCandidates,
  isJavaSkyTexturePath,
  javaSkyCandidates,
} from '../../src/core/sky/selectSkySource';
import type { ParsedPack, ParsedTexture } from '../../src/types/conversion';

function sky(path: string): ParsedTexture {
  return {
    sourcePath: path,
    canonicalId:
      path
        .split('/')
        .at(-1)
        ?.replace(/\.png$/i, '') ?? '',
    category: 'sky',
    blob: new Blob([path], { type: 'image/png' }),
  };
}

function pack(edition: ParsedPack['edition'], paths: string[]): ParsedPack {
  return { name: 'sky.zip', edition, files: [], textures: paths.map(sky) };
}

function cubemapSet(directory: string, indexes = [0, 1, 2, 3, 4, 5]): string[] {
  return indexes.map((index) => `${directory}/cubemap_${index}.png`);
}

describe('sky source selection', () => {
  it('prioritizes modern OptiFine world0 layers, then MCPatcher and generic Java sheets', () => {
    const input = pack('java', [
      'sky.png',
      'assets/minecraft/mcpatcher/sky/world0/sky1.png',
      'assets/minecraft/optifine/sky/world0/sky2.png',
      'assets/minecraft/optifine/sky/world0/sky999.png',
      'assets/minecraft/optifine/sky/world0/sky1.png',
      'assets/minecraft/textures/environment/sky.png',
    ]);

    expect(javaSkyCandidates(input).map((candidate) => candidate.texture.sourcePath)).toEqual([
      'assets/minecraft/optifine/sky/world0/sky1.png',
      'assets/minecraft/optifine/sky/world0/sky2.png',
      'assets/minecraft/optifine/sky/world0/sky999.png',
      'assets/minecraft/mcpatcher/sky/world0/sky1.png',
      'assets/minecraft/textures/environment/sky.png',
      'sky.png',
    ]);
  });

  it('does not treat vanilla end_sky or unrelated same-named files as Java cubemap sheets', () => {
    expect(isJavaSkyTexturePath('assets/minecraft/textures/environment/end_sky.png')).toBe(false);
    expect(isJavaSkyTexturePath('assets/minecraft/textures/entity/sky.png')).toBe(false);
  });

  it('keeps Bedrock cubemap directories separate and ranks the standard overworld path first', () => {
    const standard = 'textures/environment/overworld_cubemap';
    const custom = 'textures/custom/night_cubemap';
    const candidates = bedrockCubemapCandidates(
      pack('bedrock', [...cubemapSet(custom), ...cubemapSet(standard)]),
    );

    expect(candidates.map((candidate) => candidate.directory)).toEqual([standard, custom]);
    expect(candidates.every((candidate) => candidate.faces?.length === 6)).toBe(true);
    expect(candidates[0]?.faces?.every((face) => face.sourcePath.startsWith(standard))).toBe(true);
  });

  it('reports incomplete, extra, and duplicate face sets before conversion', () => {
    const incomplete = bedrockCubemapCandidates(
      pack('bedrock', cubemapSet('textures/environment/overworld_cubemap', [0, 1, 2, 4, 5])),
    )[0];
    const extra = bedrockCubemapCandidates(
      pack('bedrock', cubemapSet('textures/environment/overworld_cubemap', [0, 1, 2, 3, 4, 5, 6])),
    )[0];
    const duplicate = bedrockCubemapCandidates(
      pack('bedrock', [
        ...cubemapSet('textures/environment/overworld_cubemap'),
        'textures/environment/overworld_cubemap/CUBEMAP_0.png',
      ]),
    )[0];

    expect(incomplete).toMatchObject({ issue: 'missing', missing: [3] });
    expect(extra).toMatchObject({ issue: 'unexpected', unexpected: [6] });
    expect(duplicate).toMatchObject({ issue: 'duplicate' });
  });
});
