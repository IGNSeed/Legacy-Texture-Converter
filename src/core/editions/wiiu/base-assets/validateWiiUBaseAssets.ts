import type { OutputFile } from '../../../../types/conversion';
import { EXPECTED_WIIU_BASE_DIMENSIONS, baseAssetGroup, WIIU_BASE_ASSET_PATHS } from './manifest';
import type {
  WiiUBaseAssetGroup,
  WiiUBaseAssetGroupValidation,
  WiiUBaseAssetIssue,
  WiiUBaseAssetValidation,
} from './types';

const GROUPS: WiiUBaseAssetGroup[] = ['items', 'terrain', 'particles', 'armor', 'specialTextures'];
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

async function pngDimensions(blob: Blob): Promise<{ width: number; height: number } | undefined> {
  const bytes = new Uint8Array(await blob.slice(0, 24).arrayBuffer());
  if (bytes.length < 24 || PNG_SIGNATURE.some((value, index) => bytes[index] !== value)) {
    return undefined;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  return width > 0 && height > 0 ? { width, height } : undefined;
}

function emptyGroup(pathGroup: WiiUBaseAssetGroup): WiiUBaseAssetGroupValidation {
  return {
    ok: false,
    required: WIIU_BASE_ASSET_PATHS.filter((path) => baseAssetGroup(path) === pathGroup).length,
    present: 0,
    issues: [],
  };
}

export async function validateWiiUBaseAssets(
  files: readonly OutputFile[],
): Promise<WiiUBaseAssetValidation> {
  const byPath = new Map(files.map((file) => [file.path, file.blob]));
  const groups = Object.fromEntries(GROUPS.map((group) => [group, emptyGroup(group)])) as Record<
    WiiUBaseAssetGroup,
    WiiUBaseAssetGroupValidation
  >;
  const missing: string[] = [];
  const invalid: WiiUBaseAssetIssue[] = [];

  for (const path of WIIU_BASE_ASSET_PATHS) {
    const group = groups[baseAssetGroup(path)];
    const blob = byPath.get(path);
    if (!blob) {
      missing.push(path);
      group.issues.push({ path, reason: 'missing' });
      continue;
    }
    group.present += 1;
    if (!path.toLowerCase().endsWith('.png')) continue;

    const dimensions = await pngDimensions(blob);
    if (!dimensions) {
      const issue: WiiUBaseAssetIssue = { path, reason: 'invalid-png' };
      invalid.push(issue);
      group.issues.push(issue);
      continue;
    }
    const expected = EXPECTED_WIIU_BASE_DIMENSIONS[path];
    if (
      expected &&
      (dimensions.width !== expected.width || dimensions.height !== expected.height)
    ) {
      const issue: WiiUBaseAssetIssue = {
        path,
        reason: 'unexpected-dimensions',
        detail: `${dimensions.width}x${dimensions.height}; expected ${expected.width}x${expected.height}`,
      };
      invalid.push(issue);
      group.issues.push(issue);
    }
  }

  for (const group of GROUPS) groups[group].ok = groups[group].issues.length === 0;
  return { valid: missing.length === 0 && invalid.length === 0, groups, missing, invalid };
}
