import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import JSZip from 'jszip';

const projectRoot = resolve(import.meta.dirname, '..');
const stableTimestamp = new Date('2000-01-01T00:00:00.000Z');

for (const version of ['latest', '1.8']) {
  const sourceRoot = resolve(projectRoot, `LocalAssets/ps3/${version}/default`);
  const outputPath = resolve(
    projectRoot,
    `public/assets/ps3/${version}/ps3-${version}-base-assets.zip`,
  );
  const manifest = JSON.parse(
    await readFile(
      resolve(projectRoot, `data/mappings/ps3/${version}/default-assets.json`),
      'utf8',
    ),
  );
  const archive = new JSZip();
  for (const path of manifest.files) {
    archive.file(path, await readFile(resolve(sourceRoot, ...path.split('/'))), {
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
  console.log(
    `Bundled ${manifest.files.length} PS3 ${version} baseline files (${bytes.length} bytes).`,
  );
}
