import { describe, expect, it } from 'vitest';
import { convertGuiTextures } from '../../src/core/gui-textures/convertGuiTextures';
import { selectGuiTextures } from '../../src/core/gui-textures/selectGuiTextures';
import { createConversionReport } from '../../src/core/report/createConversionReport';
import type { ParsedPack, ParsedTexture } from '../../src/types/conversion';

const paths = {
  icons: 'Common/res/gui/icons.png',
  widgets: 'Common/res/gui/widgets.png',
};

function texture(path: string, marker: string): ParsedTexture {
  return {
    sourcePath: path,
    canonicalId:
      path
        .split('/')
        .at(-1)
        ?.replace(/\.png$/i, '') ?? '',
    category: 'gui',
    blob: new Blob([marker], { type: 'image/png' }),
  };
}

function pack(edition: ParsedPack['edition'], textures: ParsedTexture[]): ParsedPack {
  return { name: `${edition}.zip`, edition, files: [], textures };
}

function convert(input: ParsedPack) {
  const report = createConversionReport(input);
  const processed = new Set<string>();
  const output = convertGuiTextures(input, paths, report, processed);
  return { output, processed, report };
}

describe('raw GUI texture passthrough', () => {
  it('copies Java icons.png to Common/res/gui/icons.png without changing its bytes', async () => {
    const source = texture('assets/minecraft/textures/gui/icons.png', 'icons-original-bytes');
    const { output } = convert(pack('java', [source]));
    const copied = output.find((file) => file.path === paths.icons);

    expect(copied?.blob).toBe(source.blob);
    expect(new Uint8Array(await copied!.blob.arrayBuffer())).toEqual(
      new Uint8Array(await source.blob.arrayBuffer()),
    );
  });

  it('copies Java widgets.png to Common/res/gui/widgets.png', async () => {
    const source = texture('assets/minecraft/textures/gui/widgets.png', 'widgets-original-bytes');
    const { output } = convert(pack('java', [source]));
    const copied = output.find((file) => file.path === paths.widgets);

    expect(copied?.blob).toBe(source.blob);
    expect(await copied?.blob.text()).toBe('widgets-original-bytes');
  });

  it('renames Bedrock gui.png to widgets.png without re-encoding it', async () => {
    const source = texture('textures/gui/gui.png', 'bedrock-gui-original-bytes');
    const { output, report } = convert(pack('bedrock', [source]));
    const copied = output.find((file) => file.path === paths.widgets);

    expect(copied?.blob).toBe(source.blob);
    expect(await copied?.blob.text()).toBe('bedrock-gui-original-bytes');
    expect(report.entries).toContainEqual(
      expect.objectContaining({
        sourcePath: source.sourcePath,
        destination: paths.widgets,
        messageKey: 'messages.guiRenamedToWidgets',
      }),
    );
  });

  it('selects Java widgets.png and Bedrock gui.png deterministically when both exist', () => {
    const javaWidgets = texture('assets/minecraft/textures/gui/widgets.png', 'java-widgets');
    const javaGui = texture('assets/minecraft/textures/gui/gui.png', 'java-gui');
    const bedrockWidgets = texture('textures/gui/widgets.png', 'bedrock-widgets');
    const bedrockGui = texture('textures/gui/gui.png', 'bedrock-gui');

    for (const textures of [
      [javaWidgets, javaGui],
      [javaGui, javaWidgets],
    ]) {
      const selection = selectGuiTextures(pack('java', textures)).find(
        (item) => item.destination === 'widgets',
      );
      expect(selection?.selected).toBe(javaWidgets);
      expect(selection?.rejected).toEqual([javaGui]);
    }

    for (const textures of [
      [bedrockWidgets, bedrockGui],
      [bedrockGui, bedrockWidgets],
    ]) {
      const selection = selectGuiTextures(pack('bedrock', textures)).find(
        (item) => item.destination === 'widgets',
      );
      expect(selection?.selected).toBe(bedrockGui);
      expect(selection?.rejected).toEqual([bedrockWidgets]);
    }
  });

  it('recognizes Java gui/gui.png as the legacy widget sheet', () => {
    const legacy = texture('gui/gui.png', 'legacy-java-widgets');
    const nonstandardModern = texture('assets/minecraft/textures/gui/gui.png', 'other-gui');
    const selection = selectGuiTextures(pack('java', [nonstandardModern, legacy])).find(
      (item) => item.destination === 'widgets',
    );

    expect(selection?.selected).toBe(legacy);
  });

  it('ignores same-named images outside recognized Minecraft GUI paths', () => {
    const unrelated = texture('assets/minecraft/textures/entity/menu/gui.png', 'unrelated');
    const { output, processed } = convert(pack('java', [unrelated]));

    expect(output).toEqual([]);
    expect(processed).not.toContain(unrelated.sourcePath);
  });
});
