import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const outputRoot = resolve(projectRoot, 'dist');
const pagesBase = '/Legacy-Texture-Converter/';
const allowedImageAssets = new Set();

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory())
      files.push(...(await listFiles(resolve(directory, entry.name), relative)));
    else files.push(relative);
  }
  return files;
}

const indexHtml = await readFile(resolve(outputRoot, 'index.html'), 'utf8');
const localReferences = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path) => !/^(?:https?:|data:|#)/.test(path));

if (localReferences.length === 0 || localReferences.some((path) => !path.startsWith(pagesBase))) {
  throw new Error(`dist/index.html contains an asset URL outside ${pagesBase}`);
}
if (indexHtml.includes('/src/main.tsx')) {
  throw new Error('dist/index.html still references the Vite source entry point');
}

const files = await listFiles(outputRoot);
const restrictedRoots = ['references/', '.codex/', 'localassets/', '.local-assets/'];
const leakedPaths = files.filter((file) => {
  const lower = file.toLowerCase();
  return restrictedRoots.some((root) => lower === root.slice(0, -1) || lower.startsWith(root));
});
if (leakedPaths.length > 0) {
  throw new Error(`Local-only paths found in dist: ${leakedPaths.join(', ')}`);
}

const imageFiles = files.filter((file) => /\.(?:png|jpe?g|webp|gif|bmp)$/i.test(file));
const unreviewedImages = imageFiles.filter((file) => !allowedImageAssets.has(file));
if (unreviewedImages.length > 0) {
  throw new Error(`Unreviewed binary images found in dist: ${unreviewedImages.join(', ')}`);
}

console.log(
  `Pages build verified: ${localReferences.length} base-prefixed asset references, 0 unreviewed images.`,
);
