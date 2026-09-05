import {
  EXPECTED_SWITCH_BASE_DIMENSIONS,
  SWITCH_BASE_ASSET_PATHS,
} from '../../src/core/editions/switch/base-assets/manifest';
import type { OutputFile } from '../../src/types/conversion';
import { pngBlob } from './png';
import { syntheticMediaArchiveBlob } from './mediaArchive';

export function completeSwitchBaseFiles(marker = 'switch-base'): OutputFile[] {
  return SWITCH_BASE_ASSET_PATHS.map((path) => {
    if (path.endsWith('.arc')) return { path, blob: syntheticMediaArchiveBlob('switch') };
    if (!path.endsWith('.png')) return { path, blob: new Blob([marker], { type: 'text/plain' }) };
    const dimensions = EXPECTED_SWITCH_BASE_DIMENSIONS[path] ?? { width: 16, height: 16 };
    return { path, blob: pngBlob(dimensions.width, dimensions.height, marker) };
  });
}
