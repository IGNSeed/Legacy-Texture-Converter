import { describe, expect, it } from 'vitest';
import { basePathForMode, GITHUB_PAGES_BASE } from '../../vite.config';

describe('GitHub Pages configuration', () => {
  it('uses the repository subpath for production and test builds', () => {
    expect(GITHUB_PAGES_BASE).toBe('/Legacy-Texture-Converter/');
    expect(basePathForMode('production')).toBe(GITHUB_PAGES_BASE);
    expect(basePathForMode('test')).toBe(GITHUB_PAGES_BASE);
  });

  it('keeps the local development server at the root path', () => {
    expect(basePathForMode('development')).toBe('/');
  });
});
