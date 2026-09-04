import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export const GITHUB_PAGES_BASE = '/Legacy-Texture-Converter/';
export function basePathForMode(mode: string): string {
  return mode === 'development' ? '/' : GITHUB_PAGES_BASE;
}

export default defineConfig(({ mode }) => ({
  base: basePathForMode(mode),
  // Game-derived baseline files are always user supplied and must never be copied into dist.
  publicDir: false,
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
}));
