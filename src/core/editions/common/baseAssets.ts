import type { OutputFile, TargetEdition } from '../../../types/conversion';

export type BaseAssetGroup = 'items' | 'terrain' | 'particles' | 'armor' | 'specialTextures';

export interface BaseAssetIssue {
  path: string;
  reason: 'missing' | 'invalid-png' | 'unexpected-dimensions';
  detail?: string;
}

export interface BaseAssetGroupValidation {
  ok: boolean;
  required: number;
  present: number;
  issues: BaseAssetIssue[];
}

export interface BaseAssetValidation {
  valid: boolean;
  groups: Record<BaseAssetGroup, BaseAssetGroupValidation>;
  missing: string[];
  invalid: BaseAssetIssue[];
}

export interface ConsoleBaseAssetSet<TTarget extends TargetEdition = TargetEdition> {
  target: TTarget;
  provider: 'bundled' | 'user-supplied';
  name: string;
  files: OutputFile[];
  byPath: ReadonlyMap<string, Blob>;
  atlases: {
    items: Blob;
    terrain: Blob;
    particles: Blob;
  };
  armor: ReadonlyMap<string, Blob>;
  specialTextures: ReadonlyMap<string, Blob>;
  validation: BaseAssetValidation;
}

const GROUPS: BaseAssetGroup[] = ['items', 'terrain', 'particles', 'armor', 'specialTextures'];
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

export interface BaseAssetValidationDefinition {
  paths: readonly string[];
  expectedDimensions: Readonly<Partial<Record<string, { width: number; height: number }>>>;
  groupForPath(path: string): BaseAssetGroup;
}

function emptyGroup(
  group: BaseAssetGroup,
  definition: BaseAssetValidationDefinition,
): BaseAssetGroupValidation {
  return {
    ok: false,
    required: definition.paths.filter((path) => definition.groupForPath(path) === group).length,
    present: 0,
    issues: [],
  };
}

export async function validateBaseAssets(
  files: readonly OutputFile[],
  definition: BaseAssetValidationDefinition,
): Promise<BaseAssetValidation> {
  const byPath = new Map(files.map((file) => [file.path, file.blob]));
  const groups = Object.fromEntries(
    GROUPS.map((group) => [group, emptyGroup(group, definition)]),
  ) as Record<BaseAssetGroup, BaseAssetGroupValidation>;
  const missing: string[] = [];
  const invalid: BaseAssetIssue[] = [];

  for (const path of definition.paths) {
    const group = groups[definition.groupForPath(path)];
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
      const issue: BaseAssetIssue = { path, reason: 'invalid-png' };
      invalid.push(issue);
      group.issues.push(issue);
      continue;
    }
    const expected = definition.expectedDimensions[path];
    if (
      expected &&
      (dimensions.width !== expected.width || dimensions.height !== expected.height)
    ) {
      const issue: BaseAssetIssue = {
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
