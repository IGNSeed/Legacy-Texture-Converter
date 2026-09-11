import { describe, expect, it } from 'vitest';
import { convertGuiTextures } from '../../src/core/gui-textures/convertGuiTextures';
import { convertJavaInventoryTexture } from '../../src/core/gui-textures/convertJavaInventoryTexture';
import { convertPackIcon } from '../../src/core/gui-textures/convertPackIcon';
import { PS3_PATHS } from '../../src/core/editions/ps3/paths';
import { SWITCH_PATHS } from '../../src/core/editions/switch/paths';
import { WIIU_PATHS } from '../../src/core/editions/wiiu/paths';
import { selectGuiTextures } from '../../src/core/gui-textures/selectGuiTextures';
import { selectJavaInventoryTexture } from '../../src/core/gui-textures/selectJavaInventoryTexture';
import { selectPackIcon } from '../../src/core/gui-textures/selectPackIcon';
import { mergeOutputFiles } from '../../src/core/packaging/mergeOutputFiles';
import { parseJavaPack } from '../../src/core/parsers/java/parseJavaPack';
import { createConversionReport } from '../../src/core/report/createConversionReport';
import type { ParsedPack, ParsedTexture, VirtualFile } from '../../src/types/conversion';

const paths = {
  icons: 'Common/res/gui/icons.png',
  widgets: 'Common/res/gui/widgets.png',
};
const inventoryPath = 'Common/res/gui/inventory.png';
const packIconPath = 'Common/res/gui/pack_icon.png';

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
  it('uses the verified Common GUI inventory destination for every target', () => {
    expect([WIIU_PATHS.guiInventory, SWITCH_PATHS.guiInventory, PS3_PATHS.guiInventory]).toEqual([
      inventoryPath,
      inventoryPath,
      inventoryPath,
    ]);
    expect([WIIU_PATHS.guiPackIcon, SWITCH_PATHS.guiPackIcon, PS3_PATHS.guiPackIcon]).toEqual([
      packIconPath,
      packIconPath,
      packIconPath,
    ]);
  });

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

  it('copies the exact Java inventory.png bytes to the Console GUI path', async () => {
    const source = texture(
      'assets/minecraft/textures/gui/container/inventory.png',
      'inventory-original-bytes',
    );
    const input = pack('java', [source]);
    const report = createConversionReport(input);
    const processed = new Set<string>();
    const output = convertJavaInventoryTexture(input, inventoryPath, report, processed);

    expect(output).toEqual([{ path: inventoryPath, blob: source.blob }]);
    expect(output[0].blob).toBe(source.blob);
    expect(new Uint8Array(await output[0].blob.arrayBuffer())).toEqual(
      new Uint8Array(await source.blob.arrayBuffer()),
    );
    expect(processed).toContain(source.sourcePath);
    expect(report.entries).toContainEqual(
      expect.objectContaining({
        canonicalId: 'gui.raw.inventory',
        destination: inventoryPath,
        status: 'converted',
      }),
    );
  });

  it('recognizes a wrapped mixed-case Java inventory path with Windows separators', async () => {
    const source: VirtualFile = {
      path: 'Wrapped Pack\\Assets\\Minecraft\\Textures\\Gui\\Container\\Inventory.PNG',
      name: 'Inventory.PNG',
      blob: new Blob(['wrapped-inventory'], { type: 'image/png' }),
    };
    const parsed = await parseJavaPack('wrapped.zip', [source]);
    const selection = selectJavaInventoryTexture(parsed);

    expect(parsed.textures).toMatchObject([
      { sourcePath: source.path, canonicalId: 'inventory', category: 'gui' },
    ]);
    expect(selection.selected?.blob).toBe(source.blob);
  });

  it('keeps a base inventory when Java has no replacement and never applies Java passthrough to Bedrock', () => {
    const baseInventory = new Blob(['base-inventory']);
    const java = pack('java', []);
    const bedrockCandidate = texture(
      'assets/minecraft/textures/gui/container/inventory.png',
      'bedrock-inventory',
    );
    const bedrock = pack('bedrock', [bedrockCandidate]);

    for (const input of [java, bedrock]) {
      const report = createConversionReport(input);
      const overrides = convertJavaInventoryTexture(
        input,
        inventoryPath,
        report,
        new Set<string>(),
      );
      const merged = mergeOutputFiles([{ path: inventoryPath, blob: baseInventory }], overrides);
      expect(merged).toEqual([{ path: inventoryPath, blob: baseInventory }]);
    }
  });

  it.each([
    ['java', 'pack.png', 'java-pack-icon', 'messages.javaPackIconRenamed'],
    ['bedrock', 'Wrapped Pack\\PACK_ICON.PNG', 'bedrock-pack-icon', 'messages.packIconCopied'],
  ] as const)(
    'copies the %s pack icon bytes to Common/res/gui/pack_icon.png',
    async (edition, sourcePath, marker, messageKey) => {
      const source: VirtualFile = {
        path: sourcePath,
        name: sourcePath.split(/[\\/]/).at(-1)!,
        blob: new Blob([marker], { type: 'image/png' }),
      };
      const input: ParsedPack = {
        name: `${edition}.zip`,
        edition,
        files: [source],
        textures: [],
      };
      const report = createConversionReport(input);
      const processed = new Set<string>();
      const output = convertPackIcon(input, packIconPath, report, processed);

      expect(output).toEqual([{ path: packIconPath, blob: source.blob }]);
      expect(output[0].blob).toBe(source.blob);
      expect(new Uint8Array(await output[0].blob.arrayBuffer())).toEqual(
        new Uint8Array(await source.blob.arrayBuffer()),
      );
      expect(processed).toContain(source.path);
      expect(report.entries).toContainEqual(
        expect.objectContaining({
          sourcePath,
          canonicalId: 'gui.raw.pack_icon',
          destination: packIconPath,
          status: 'converted',
          messageKey,
        }),
      );
    },
  );

  it('prefers the exact pack root icon and rejects wrong-edition or deeply nested names', () => {
    const javaRoot: VirtualFile = {
      path: 'pack.png',
      name: 'pack.png',
      blob: new Blob(['java-root']),
    };
    const javaWrapped: VirtualFile = {
      path: 'Wrapper/pack.png',
      name: 'pack.png',
      blob: new Blob(['java-wrapped']),
    };
    const javaWrongName: VirtualFile = {
      path: 'pack_icon.png',
      name: 'pack_icon.png',
      blob: new Blob(['java-wrong-name']),
    };
    const javaNested: VirtualFile = {
      path: 'Outer/Inner/pack.png',
      name: 'pack.png',
      blob: new Blob(['java-nested']),
    };
    const javaPack: ParsedPack = {
      name: 'java.zip',
      edition: 'java',
      files: [javaWrapped, javaWrongName, javaNested, javaRoot],
      textures: [],
    };
    expect(selectPackIcon(javaPack)).toEqual({ selected: javaRoot, rejected: [javaWrapped] });

    const bedrockPack: ParsedPack = {
      ...javaPack,
      name: 'bedrock.mcpack',
      edition: 'bedrock',
      files: [javaRoot],
    };
    const baseIcon = new Blob(['base-icon']);
    const report = createConversionReport(bedrockPack);
    const overrides = convertPackIcon(bedrockPack, packIconPath, report, new Set<string>());
    expect(mergeOutputFiles([{ path: packIconPath, blob: baseIcon }], overrides)).toEqual([
      { path: packIconPath, blob: baseIcon },
    ]);
  });
});
