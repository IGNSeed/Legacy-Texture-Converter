import type { SourceEdition, TargetEdition } from '../../types/conversion';

export interface HudRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HudSourceEntry {
  semantic: string;
  sheet: string;
  rect: HudRect;
}

export interface HudSourceEditionMapping {
  sheets: string[];
  entries: HudSourceEntry[];
}

export interface HudSourceMappingDocument {
  version: number;
  logicalSheetSize: number;
  editions: Record<Exclude<SourceEdition, 'unknown'>, HudSourceEditionMapping>;
}

export interface HudTargetEntry {
  semantic: string;
  descriptor: number;
  index: number;
  width: number;
  height: number;
}

export interface HudTargetFuiMapping {
  name: string;
  imageCount: number;
  entries: HudTargetEntry[];
}

export interface HudTargetMappingDocument {
  version: number;
  target: TargetEdition;
  mediaPath: string;
  storedColorOrder: 'bgra';
  fuis: HudTargetFuiMapping[];
}
