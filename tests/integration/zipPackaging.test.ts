import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { buildWiiUFileTree } from '../../src/core/packaging/buildWiiUFileTree';
import { createOutputZip } from '../../src/core/packaging/createOutputZip';
import { readZipPack } from '../../src/core/files/readZipPack';

describe('Wii U ZIP packaging', () => {
  it('overrides defaults and packages real resource paths', async () => {
    const path = 'Common/res/TitleUpdate/res/items.png';
    const files = buildWiiUFileTree(
      [{ path, blob: new Blob(['default']) }],
      [{ path, blob: new Blob(['converted']) }],
    );
    const archive = await JSZip.loadAsync(await createOutputZip(files));
    expect(await archive.file(path)?.async('text')).toBe('converted');
    expect(Object.keys(archive.files).some((entry) => /^(BASE|UPD)\//.test(entry))).toBe(false);
  });

  it('rejects unsafe output paths before creating a ZIP', async () => {
    await expect(createOutputZip([{ path: '../escape.png', blob: new Blob() }])).rejects.toThrow(
      'Unsafe archive path',
    );
  });

  it('rejects the original zip-slip name even when JSZip sanitizes its public name', async () => {
    const malicious = new JSZip();
    malicious.file('../escape.png', 'bad');
    const blob = await malicious.generateAsync({ type: 'blob' });
    await expect(readZipPack(blob)).rejects.toThrow('Unsafe archive path');
  });
});
