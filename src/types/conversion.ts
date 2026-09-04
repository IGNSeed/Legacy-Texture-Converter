export type SourceEdition = 'java' | 'bedrock' | 'unknown';
export type TargetEdition = 'wiiu' | 'switch';

export type TextureCategory = 'item' | 'terrain' | 'armor' | 'particles' | 'special' | 'unknown';

export interface VirtualFile {
  path: string;
  name: string;
  blob: Blob;
}

export interface ParsedTexture {
  sourcePath: string;
  canonicalId: string;
  category: TextureCategory;
  blob: Blob;
  animationMetadata?: string;
}

export interface ParsedPack {
  name: string;
  edition: Exclude<SourceEdition, 'unknown'>;
  files: VirtualFile[];
  textures: ParsedTexture[];
}

export type ConversionStatus = 'converted' | 'unsupported' | 'skipped' | 'resized';

export interface ConversionEntry {
  sourcePath: string;
  canonicalId: string;
  destination?: string;
  status: ConversionStatus;
  sourceResolution?: string;
  outputResolution?: string;
  messageKey?: string;
}

export interface ConversionMessage {
  code: string;
  messageKey: string;
  path?: string;
  detail?: string;
}

export interface ConversionReport {
  inputEdition: Exclude<SourceEdition, 'unknown'>;
  outputEdition: TargetEdition;
  inputName: string;
  itemResolution?: number;
  blockResolution?: number;
  converted: number;
  unsupported: number;
  skipped: number;
  resized: number;
  warnings: ConversionMessage[];
  errors: ConversionMessage[];
  entries: ConversionEntry[];
}

export interface OutputFile {
  path: string;
  blob: Blob;
}

export interface ConversionResult {
  zipBlob: Blob;
  downloadName: string;
  report: ConversionReport;
  outputFiles: OutputFile[];
}

export type ConversionStage =
  'reading' | 'analyzing' | 'mapping' | 'images' | 'atlas' | 'mipmap' | 'files' | 'zip';

export interface ConversionProgress {
  stage: ConversionStage;
  percent: number;
}

export type ProgressCallback = (progress: ConversionProgress) => void;
