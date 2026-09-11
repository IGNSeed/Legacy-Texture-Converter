import type { TextureCategory } from './conversion';

export interface AtlasPosition {
  x: number;
  y: number;
}

export interface AtlasMappingEntry {
  id: string;
  sourceNames: string[];
  sourcePaths?: Record<string, string[]>;
  positions: AtlasPosition[];
}

export interface AtlasMappingDocument {
  version: number;
  category: TextureCategory;
  atlas: {
    width: number;
    height: number;
    slotSize: number;
  };
  directAtlas?: {
    sourceNames: string[];
    destination: string;
  };
  entries: AtlasMappingEntry[];
}

export interface FileMappingEntry {
  id: string;
  sourceNames: string[];
  destinations: string[];
}

export interface SpecialTextureMapping {
  id: string;
  sourceNames: string[];
  destination: string;
  inputPolicy?: 'convert' | 'preserve-base';
  animationText?: string;
  mipmapLevels?: number;
  mipmapMinimumWidth?: number;
  mipmapMinimumHeight?: number;
  animationMode?: 'metadata' | 'fixed' | 'runtime';
}
