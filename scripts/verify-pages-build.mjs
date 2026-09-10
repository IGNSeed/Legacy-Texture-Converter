import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import JSZip from 'jszip';

const projectRoot = resolve(import.meta.dirname, '..');
const outputRoot = resolve(projectRoot, 'dist');
const pagesBase = '/Legacy-Texture-Converter/';
const allowedImageAssets = new Set();
const baselines = [
  {
    label: 'Wii U',
    path: 'assets/wiiu/default/wiiu-base-assets.zip',
    sha256: 'c58c7b5b2a8a331648a973faf9bc834b3dfbee8e0bac652c7270046e4319356b',
    manifest: 'data/mappings/wiiu/default-assets.json',
  },
  {
    label: 'Nintendo Switch Edition 1.0.17',
    path: 'assets/switch/default/switch-base-assets.zip',
    sha256: '69f28c1a6b35b4ff8a49cca08c5b3752759d8dc7e5ea6089dc213beef6791c73',
    manifest: 'data/mappings/switch/default-assets.json',
  },
  {
    label: 'PlayStation 3 Edition Latest',
    path: 'assets/ps3/latest/ps3-latest-base-assets.zip',
    sha256: 'f48dd056d293fe442dbbd898288b7bbba27d805cac7331c38110c5dab3d42d02',
    manifest: 'data/mappings/ps3/latest/default-assets.json',
  },
  {
    label: 'PlayStation 3 Edition 1.8',
    path: 'assets/ps3/1.8/ps3-1.8-base-assets.zip',
    sha256: 'fee5b4f5815f013c7c46102f2e42862c18635801807c064fb99c6e0f52ef68db',
    manifest: 'data/mappings/ps3/1.8/default-assets.json',
  },
];
const allowedArchiveAssets = new Set(baselines.map((baseline) => baseline.path));

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

const archiveFiles = files.filter((file) => /\.(?:zip|mcpack)$/i.test(file));
const unreviewedArchives = archiveFiles.filter((file) => !allowedArchiveAssets.has(file));
if (unreviewedArchives.length > 0) {
  throw new Error(`Unreviewed archives found in dist: ${unreviewedArchives.join(', ')}`);
}

const wasmFiles = files.filter((file) => file.endsWith('.wasm'));
if (wasmFiles.length !== 1 || !/^assets\/libarchive-[\w-]+\.wasm$/.test(wasmFiles[0])) {
  throw new Error(
    `Expected one Vite-managed libarchive WASM asset, found: ${wasmFiles.join(', ')}`,
  );
}
const javascriptFiles = files.filter((file) => file.endsWith('.js'));
const javascript = (
  await Promise.all(javascriptFiles.map((file) => readFile(resolve(outputRoot, file), 'utf8')))
).join('\n');
if (!javascript.includes(`${pagesBase}${wasmFiles[0]}`)) {
  throw new Error('The libarchive WASM URL is not prefixed for the GitHub Pages project path');
}
let reviewedBaselineFileCount = 0;
for (const baseline of baselines) {
  if (!archiveFiles.includes(baseline.path)) {
    throw new Error(`Published ${baseline.label} baseline archive is missing: ${baseline.path}`);
  }

  const archiveBytes = await readFile(resolve(outputRoot, baseline.path));
  const archiveHash = createHash('sha256').update(archiveBytes).digest('hex');
  if (archiveHash !== baseline.sha256) {
    throw new Error(
      `Published ${baseline.label} baseline archive hash is not approved: ${archiveHash}`,
    );
  }
  const archive = await JSZip.loadAsync(archiveBytes);
  const publishedFiles = Object.values(archive.files)
    .filter((entry) => !entry.dir)
    .map((entry) => entry.name)
    .sort();
  const manifest = JSON.parse(await readFile(resolve(projectRoot, baseline.manifest), 'utf8'));
  const expectedFiles = [...manifest.files].sort();
  if (JSON.stringify(publishedFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error(`Published ${baseline.label} baseline archive does not match its manifest`);
  }
  reviewedBaselineFileCount += publishedFiles.length;
}

console.log(
  `Pages build verified: ${localReferences.length} base-prefixed asset references, ${reviewedBaselineFileCount} reviewed baseline files, ${wasmFiles.length} lazy WASM asset.`,
);
