import type {
  ParsedTexture,
  Ps3Version,
  SourceEdition,
  TargetEdition,
} from '../../types/conversion';
import type { DecodedImage } from '../image/decodeImage';

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

export interface PreparedHudSheet {
  texture: ParsedTexture;
  image: DecodedImage;
  scale: number;
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

interface HudTargetMappingBase {
  version: number;
  target: TargetEdition;
  ps3Version?: Ps3Version;
  mediaPath: string;
}

export interface HudTargetFuiMappingDocument extends HudTargetMappingBase {
  backend: 'fui';
  storedColorOrder: 'bgra';
  fuis: HudTargetFuiMapping[];
}

export interface HudTargetSwfEntry {
  semantic: string;
  bitmapId: number;
  width: number;
  height: number;
}

export interface HudTargetSwfMapping {
  name: string;
  signature: 'FWS' | 'CWS';
  swfVersion: number;
  bitmapTagCode: 36;
  bitmapFormat: 5;
  bitmapCount: number;
  entries: HudTargetSwfEntry[];
}

export interface HudTargetSwfMappingDocument extends HudTargetMappingBase {
  backend: 'swf';
  swfs: HudTargetSwfMapping[];
}

export type HudTargetMappingDocument = HudTargetFuiMappingDocument | HudTargetSwfMappingDocument;
