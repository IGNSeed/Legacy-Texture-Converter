import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { buildWiiUFileTree } from '../../src/core/packaging/buildWiiUFileTree';
import { buildSwitchFileTree } from '../../src/core/packaging/buildSwitchFileTree';
import { createOutputZip } from '../../src/core/packaging/createOutputZip';
import { isArmorPowerTexturePath } from '../../src/core/packaging/outputFilePolicy';
import { readZipPack } from '../../src/core/files/readZipPack';

describe('Wii U ZIP packaging', () => {
  it('overrides defaults and packages real resource paths', async () => {
    const path = 'Common/res/TitleUpdate/res/items.png';
    const files = buildWiiUFileTree(
      [
        { path, blob: new Blob(['default']) },
        { path: 'Common/res/1_2_2/armor/power.png', blob: new Blob(['base-power']) },
        { path: 'Common/res/armor/Power.PNG', blob: new Blob(['case-power']) },
        { path: 'Common/res/gui/power.png', blob: new Blob(['unrelated-power']) },
      ],
      [
        { path, blob: new Blob(['converted']) },
        {
          path: 'Common\\res\\TitleUpdate\\res\\armor\\POWER.png',
          blob: new Blob(['override-power']),
        },
        { path: 'Common/res/1_2_2/armor/iron_1.png', blob: new Blob(['iron']) },
      ],
    );
    const archive = await JSZip.loadAsync(await createOutputZip(files));
    const paths = Object.keys(archive.files);
    expect(await archive.file(path)?.async('text')).toBe('converted');
    expect(paths.some(isArmorPowerTexturePath)).toBe(false);
    expect(await archive.file('Common/res/gui/power.png')?.async('text')).toBe('unrelated-power');
    expect(await archive.file('Common/res/1_2_2/armor/iron_1.png')?.async('text')).toBe('iron');
    expect(paths.some((entry) => /^(BASE|UPD)\//.test(entry))).toBe(false);
  });

  it('rejects unsafe output paths before creating a ZIP', async () => {
    await expect(createOutputZip([{ path: '../escape.png', blob: new Blob() }])).rejects.toThrow(
      'Unsafe archive path',
    );
  });

  it('filters armor power.png even when ZIP creation is called directly', async () => {
    const archive = await JSZip.loadAsync(
      await createOutputZip([
        { path: 'Common/res/armor/power.png', blob: new Blob(['excluded']) },
        { path: 'Common/res/gui/power.png', blob: new Blob(['kept']) },
      ]),
    );

    expect(archive.file('Common/res/armor/power.png')).toBeNull();
    expect(await archive.file('Common/res/gui/power.png')?.async('text')).toBe('kept');
  });

  it('rejects the original zip-slip name even when JSZip sanitizes its public name', async () => {
    const malicious = new JSZip();
    malicious.file('../escape.png', 'bad');
    const blob = await malicious.generateAsync({ type: 'blob' });
    await expect(readZipPack(blob)).rejects.toThrow('Unsafe archive path');
  });
});

describe('Switch ZIP packaging', () => {
  it('prefixes every file with the verified Atmosphère title layout', async () => {
    const path = 'Common/res/TitleUpdate/res/items.png';
    const files = buildSwitchFileTree(
      [
        { path, blob: new Blob(['default']) },
        { path: 'Common/res/TitleUpdate/res/armor/power.png', blob: new Blob(['power']) },
      ],
      [
        { path, blob: new Blob(['converted']) },
        { path: 'Common/res/armor/power.png', blob: new Blob(['other-power']) },
      ],
    );
    const archive = await JSZip.loadAsync(await createOutputZip(files));
    const outputPath = `atmosphere/contents/01006BD001E06000/romfs/${path}`;
    expect(await archive.file(outputPath)?.async('text')).toBe('converted');
    expect(Object.keys(archive.files).some(isArmorPowerTexturePath)).toBe(false);
    expect(Object.keys(archive.files).every((entry) => entry.startsWith('atmosphere/'))).toBe(true);
  });
});
