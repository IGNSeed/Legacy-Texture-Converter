import { describe, expect, it } from 'vitest';
import {
  requiredDefaultAssetPaths,
  resolveDefaultAssets,
} from '../../src/core/editions/wiiu/resolveDefaultAssets';
import type { VirtualFile } from '../../src/types/conversion';

const virtual = (path: string, value: string): VirtualFile => ({
  path,
  name: path.split('/').at(-1)!,
  blob: new Blob([value]),
});

describe('Wii U BASE + UPD baseline', () => {
  it('strips dump roots and gives UPD priority over BASE', async () => {
    const relative = 'Common/res/TitleUpdate/res/items.png';
    const resolved = resolveDefaultAssets([
      virtual(`WiiU(UPD)/${relative}`, 'update'),
      virtual(`WiiU(BASE)/${relative}`, 'base'),
    ]);
    expect(resolved.files).toHaveLength(1);
    expect(resolved.files[0].path).toBe(relative);
    expect(await resolved.files[0].blob.text()).toBe('update');
    expect(resolved.missing).toHaveLength(requiredDefaultAssetPaths().length - 1);
  });

  it('accepts a complete locally supplied baseline without shipping game assets', () => {
    const files = requiredDefaultAssetPaths().map((path) => virtual(`dump/${path}`, path));
    const resolved = resolveDefaultAssets(files);
    expect(resolved.files).toHaveLength(requiredDefaultAssetPaths().length);
    expect(resolved.missing).toEqual([]);
  });
});
