import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConversionReport } from '../../src/core/report/createConversionReport';
import { convertSkyTexture } from '../../src/core/sky/convertSkyTexture';
import { LCE_SKY_HEIGHT, LCE_SKY_WIDTH } from '../../src/core/sky/renderSkyTexture';
import type { ParsedPack, ParsedTexture } from '../../src/types/conversion';
import { pngBlob } from '../helpers/png';

interface ImageInfo {
  width: number;
  height: number;
  marker: string;
}

interface CanvasRecord {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  drawImage: ReturnType<typeof vi.fn>;
}

const imageInfo = new WeakMap<Blob, ImageInfo>();

function imageBlob(width: number, height: number, marker: string): Blob {
  const blob = pngBlob(width, height, marker);
  imageInfo.set(blob, { width, height, marker });
  return blob;
}

function skyTexture(path: string, blob: Blob): ParsedTexture {
  return {
    sourcePath: path,
    canonicalId:
      path
        .split('/')
        .at(-1)
        ?.replace(/\.png$/i, '') ?? '',
    category: 'sky',
    blob,
  };
}

function pack(edition: ParsedPack['edition'], textures: ParsedTexture[]): ParsedPack {
  return { name: `${edition}-sky.zip`, edition, files: [], textures };
}

function installCanvas(): CanvasRecord[] {
  const records: CanvasRecord[] = [];
  vi.spyOn(document, 'createElement').mockImplementation(() => {
    const drawImage = vi.fn();
    const context = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      drawImage,
    } as unknown as CanvasRenderingContext2D;
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
      toBlob: vi.fn((callback: BlobCallback) =>
        callback(pngBlob(canvas.width, canvas.height, `canvas-${records.length}`)),
      ),
    } as unknown as HTMLCanvasElement;
    records.push({ canvas, context, drawImage });
    return canvas;
  });
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn((blob: Blob) => {
      const info = imageInfo.get(blob);
      if (!info) return Promise.reject(new Error('invalid test PNG'));
      return Promise.resolve({ ...info, close: vi.fn() });
    }),
  );
  return records;
}

function dimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return blob.arrayBuffer().then((buffer) => {
    const view = new DataView(buffer);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  });
}

function bedrockFaces(
  directory = 'textures/environment/overworld_cubemap',
  sizes: readonly { width: number; height: number }[] = Array.from({ length: 6 }, () => ({
    width: 2,
    height: 2,
  })),
): ParsedTexture[] {
  return sizes.map(({ width, height }, index) =>
    skyTexture(`${directory}/cubemap_${index}.png`, imageBlob(width, height, `color-${index}`)),
  );
}

async function convert(input: ParsedPack) {
  const report = createConversionReport(input);
  const processed = new Set<string>();
  const output = await convertSkyTexture(input, 'Common/res/misc/sky.png', report, processed);
  return { output, processed, report };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('LCE sky conversion', () => {
  it('resizes the complete Java 3x2 sheet as one image without changing face positions', async () => {
    const canvases = installCanvas();
    const source = skyTexture(
      'assets/minecraft/optifine/sky/world0/sky1.png',
      imageBlob(6, 4, 'six-distinct-face-colors'),
    );
    const { output, report } = await convert(pack('java', [source]));

    expect(output).toHaveLength(1);
    expect(output[0]?.path).toBe('Common/res/misc/sky.png');
    expect(await dimensions(output[0].blob)).toEqual({
      width: LCE_SKY_WIDTH,
      height: LCE_SKY_HEIGHT,
    });
    expect(canvases).toHaveLength(1);
    expect(canvases[0]?.drawImage).toHaveBeenCalledTimes(1);
    expect(canvases[0]?.drawImage).toHaveBeenCalledWith(
      expect.objectContaining({ marker: 'six-distinct-face-colors' }),
      0,
      0,
      6,
      4,
      0,
      0,
      LCE_SKY_WIDTH,
      LCE_SKY_HEIGHT,
    );
    expect(canvases[0]?.context.imageSmoothingEnabled).toBe(true);
    expect(canvases[0]?.context.imageSmoothingQuality).toBe('high');
    expect(report.entries).toContainEqual(
      expect.objectContaining({ canonicalId: 'sky.java', status: 'resized' }),
    );
  });

  it('combines Bedrock faces in the 5 4 2 / 3 0 1 layout, then resizes the whole sheet', async () => {
    const canvases = installCanvas();
    const input = pack('bedrock', [...bedrockFaces()].reverse());
    const { output } = await convert(input);

    expect(output).toHaveLength(1);
    expect(await dimensions(output[0].blob)).toEqual({
      width: LCE_SKY_WIDTH,
      height: LCE_SKY_HEIGHT,
    });
    expect(canvases).toHaveLength(2);
    const expectedLayout = [
      ['color-5', 0, 0],
      ['color-4', 2, 0],
      ['color-2', 4, 0],
      ['color-3', 0, 2],
      ['color-0', 2, 2],
      ['color-1', 4, 2],
    ] as const;
    expectedLayout.forEach(([marker, x, y], index) => {
      expect(canvases[0]?.drawImage).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({ marker }),
        0,
        0,
        2,
        2,
        x,
        y,
        2,
        2,
      );
    });
    expect(canvases[1].drawImage).toHaveBeenCalledWith(
      canvases[0].canvas,
      0,
      0,
      6,
      4,
      0,
      0,
      LCE_SKY_WIDTH,
      LCE_SKY_HEIGHT,
    );
  });

  it.each([
    {
      name: 'a five-face cubemap',
      textures: () => bedrockFaces().slice(0, 5),
      warning: 'bedrock-sky-missing-faces',
    },
    {
      name: 'a cubemap directory with an extra seventh face',
      textures: () => [
        ...bedrockFaces(),
        skyTexture(
          'textures/environment/overworld_cubemap/cubemap_6.png',
          imageBlob(2, 2, 'color-6'),
        ),
      ],
      warning: 'bedrock-sky-unexpected-faces',
    },
    {
      name: 'mismatched face sizes',
      textures: () =>
        bedrockFaces('textures/environment/overworld_cubemap', [
          { width: 2, height: 2 },
          { width: 2, height: 2 },
          { width: 4, height: 4 },
          { width: 2, height: 2 },
          { width: 2, height: 2 },
          { width: 2, height: 2 },
        ]),
      warning: 'bedrock-sky-dimensions',
    },
    {
      name: 'non-square faces',
      textures: () =>
        bedrockFaces(
          'textures/environment/overworld_cubemap',
          Array.from({ length: 6 }, () => ({ width: 2, height: 3 })),
        ),
      warning: 'bedrock-sky-dimensions',
    },
  ])('skips $name without creating a fabricated sky', async ({ textures, warning }) => {
    installCanvas();
    const { output, report } = await convert(pack('bedrock', textures()));

    expect(output).toEqual([]);
    expect(report.warnings.map((item) => item.code)).toContain(warning);
    if (warning === 'bedrock-sky-missing-faces') {
      expect(report.warnings[0]?.path).toContain('cubemap_5.png');
    }
  });

  it('never mixes cubemap faces from different directories', async () => {
    installCanvas();
    const textures = [
      ...bedrockFaces('textures/environment/overworld_cubemap').slice(0, 3),
      ...bedrockFaces('textures/custom/other_cubemap').slice(3),
    ];
    const { output, report } = await convert(pack('bedrock', textures));

    expect(output).toEqual([]);
    expect(
      report.warnings.filter((item) => item.code === 'bedrock-sky-missing-faces'),
    ).toHaveLength(2);
  });

  it('falls back from an invalid Java candidate and reports deterministic multiple selection', async () => {
    installCanvas();
    const invalid = skyTexture(
      'assets/minecraft/optifine/sky/world0/sky1.png',
      imageBlob(8, 4, 'invalid-layout'),
    );
    const selected = skyTexture(
      'assets/minecraft/mcpatcher/sky/world0/sky1.png',
      imageBlob(6, 4, 'valid-layout'),
    );
    const rejected = skyTexture('sky.png', imageBlob(6, 4, 'lower-priority'));
    const { output, report } = await convert(pack('java', [rejected, selected, invalid]));

    expect(output).toHaveLength(1);
    expect(report.warnings.map((item) => item.code)).toEqual(
      expect.arrayContaining(['java-sky-dimensions', 'multiple-java-sky-candidates']),
    );
    expect(report.entries).toContainEqual(
      expect.objectContaining({
        sourcePath: rejected.sourcePath,
        messageKey: 'messages.skyCandidateNotSelected',
      }),
    );
  });

  it('selects the standard Bedrock overworld set over another complete set', async () => {
    installCanvas();
    const custom = bedrockFaces('textures/custom/night_cubemap');
    const standard = bedrockFaces('textures/environment/overworld_cubemap');
    const { output, report } = await convert(pack('bedrock', [...custom, ...standard]));

    expect(output).toHaveLength(1);
    expect(report.warnings).toContainEqual(
      expect.objectContaining({
        code: 'multiple-bedrock-sky-candidates',
        path: 'textures/environment/overworld_cubemap',
      }),
    );
    expect(report.entries).toContainEqual(
      expect.objectContaining({
        sourcePath: 'textures/custom/night_cubemap',
        messageKey: 'messages.skyCandidateNotSelected',
      }),
    );
  });

  it('skips invalid PNG data and accepts a pack with no sky without crashing', async () => {
    installCanvas();
    const invalid = skyTexture(
      'assets/minecraft/optifine/sky/world0/sky1.png',
      new Blob(['not-png']),
    );
    const invalidResult = await convert(pack('java', [invalid]));
    const emptyResult = await convert(pack('java', []));

    expect(invalidResult.output).toEqual([]);
    expect(invalidResult.report.warnings).toContainEqual(
      expect.objectContaining({ code: 'sky-invalid-png' }),
    );
    expect(emptyResult.output).toEqual([]);
    expect(emptyResult.report.warnings).toEqual([]);
  });
});
