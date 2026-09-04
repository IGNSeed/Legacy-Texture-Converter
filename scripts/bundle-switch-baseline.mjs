import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import JSZip from 'jszip';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(projectRoot, 'LocalAssets/switch/default');
const outputPath = resolve(projectRoot, 'public/assets/switch/default/switch-base-assets.zip');
const manifest = JSON.parse(
  await readFile(resolve(projectRoot, 'data/mappings/switch/default-assets.json'), 'utf8'),
);
const archive = new JSZip();
const stableTimestamp = new Date('2000-01-01T00:00:00.000Z');

for (const path of manifest.files) {
  const sourcePath = resolve(sourceRoot, ...path.split('/'));
  archive.file(path, await readFile(sourcePath), {
    binary: true,
    createFolders: false,
    date: stableTimestamp,
  });
}

const bytes = await archive.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
  platform: 'DOS',
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, bytes);
console.log(`Bundled ${manifest.files.length} Switch baseline files (${bytes.length} bytes).`);
