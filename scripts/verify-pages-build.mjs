import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import JSZip from 'jszip';

const projectRoot = resolve(import.meta.dirname, '..');
const outputRoot = resolve(projectRoot, 'dist');
const pagesBase = '/Legacy-Texture-Converter/';
const allowedImageAssets = new Set();
const bundledBaselinePath = 'assets/wiiu/default/wiiu-base-assets.zip';
const bundledBaselineSha256 = 'ee4ea1509613c5c7e61edfce839834e3ae691fbcbeded35ea39f613db086fbdc';
const allowedArchiveAssets = new Set([bundledBaselinePath]);
const baselineManifest = JSON.parse(
  await readFile(resolve(projectRoot, 'data/mappings/wiiu/default-assets.json'), 'utf8'),
);

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
if (!archiveFiles.includes(bundledBaselinePath)) {
  throw new Error(`Published baseline archive is missing: ${bundledBaselinePath}`);
}

const baselineArchiveBytes = await readFile(resolve(outputRoot, bundledBaselinePath));
const baselineArchiveHash = createHash('sha256').update(baselineArchiveBytes).digest('hex');
if (baselineArchiveHash !== bundledBaselineSha256) {
  throw new Error(`Published baseline archive hash is not approved: ${baselineArchiveHash}`);
}
const baselineArchive = await JSZip.loadAsync(baselineArchiveBytes);
const publishedBaselineFiles = Object.values(baselineArchive.files)
  .filter((entry) => !entry.dir)
  .map((entry) => entry.name)
  .sort();
const expectedBaselineFiles = [...baselineManifest.files].sort();
if (JSON.stringify(publishedBaselineFiles) !== JSON.stringify(expectedBaselineFiles)) {
  throw new Error('Published baseline archive does not match default-assets.json');
}

console.log(
  `Pages build verified: ${localReferences.length} base-prefixed asset references, ${publishedBaselineFiles.length} reviewed baseline files.`,
);
