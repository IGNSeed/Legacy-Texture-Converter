import type { OutputFile, VirtualFile } from '../../../../types/conversion';

export type WiiUBaseAssetGroup = 'items' | 'terrain' | 'particles' | 'armor' | 'specialTextures';

export interface WiiUBaseAssetIssue {
  path: string;
  reason: 'missing' | 'invalid-png' | 'unexpected-dimensions';
  detail?: string;
}

export interface WiiUBaseAssetGroupValidation {
  ok: boolean;
  required: number;
  present: number;
  issues: WiiUBaseAssetIssue[];
}

export interface WiiUBaseAssetValidation {
  valid: boolean;
  groups: Record<WiiUBaseAssetGroup, WiiUBaseAssetGroupValidation>;
  missing: string[];
  invalid: WiiUBaseAssetIssue[];
}

export interface WiiUBaseAssetSet {
  target: 'wiiu';
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
  validation: WiiUBaseAssetValidation;
}

export interface WiiUBaseAssetLoadResult {
  assetSet?: WiiUBaseAssetSet;
  validation: WiiUBaseAssetValidation;
}

export interface WiiUBaseAssetProvider {
  readonly id: string;
  load(): Promise<WiiUBaseAssetLoadResult>;
}

export interface WiiUBaseAssetInput {
  name: string;
  files: VirtualFile[];
}
