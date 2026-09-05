import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, it } from 'vitest';
import { findArcEntry, getArcEntryData, parseArc, serializeArc } from '../../src/core/binary/arc';
import { findFuiImage, getFuiImageData, parseFui, serializeFui } from '../../src/core/binary/fui';
import { inspectPngBytes } from '../../src/core/binary/png';
import { hudTargetMapping } from '../../src/core/gui-hud/mappings';
import { validateHudTargetFui } from '../../src/core/gui-hud/validation';

const projectRoot = cwd();
const cases = [
  {
    target: 'wiiu',
    path: resolve(projectRoot, 'References/wiiu/WiiU(UPD)/Common/Media/MediaWiiU.arc'),
    size: 29_246_646,
    sha256: '02cac0f823385f018f3ec12eed7a1037ebac2049d4a1adddce6ce0612c8a2e27',
  },
  {
    target: 'switch',
    path: resolve(projectRoot, 'References/switch/Common/Media/MediaNX.arc'),
    size: 38_257_396,
    sha256: '9acddc0c1bbd9f40ddd9045e52495b4034d0cbbbc52db7fe45686a7f2bbc864a',
  },
];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function referencesAvailable() {
  try {
    await Promise.all(cases.map(({ path }) => access(path)));
    return true;
  } catch {
    return false;
  }
}

describe.skipIf(!(await referencesAvailable()))('actual Media ARC integration', () => {
  for (const reference of cases) {
    it(`round-trips and rebuilds the verified ${reference.target} archive`, async () => {
      const bytes = new Uint8Array(await readFile(reference.path));
      expect(bytes.byteLength).toBe(reference.size);
      expect(sha256(bytes)).toBe(reference.sha256);

      const archive = parseArc(bytes);
      expect(sha256(serializeArc(archive, new Map()))).toBe(reference.sha256);

      const archiveReplacements = new Map();
      const mapping = hudTargetMapping(reference.target);
      for (const fuiMapping of mapping.fuis) {
        const arcEntry = findArcEntry(archive, fuiMapping.name);
        expect(arcEntry).toBeDefined();
        const fui = parseFui(getArcEntryData(archive, arcEntry));
        validateHudTargetFui(fuiMapping, fui);

        const destination = findFuiImage(fui, 39);
        const donor = findFuiImage(fui, 43);
        expect(destination).toMatchObject({ width: 9, height: 9 });
        expect(donor).toMatchObject({ width: 9, height: 9 });
        const donorPng = getFuiImageData(fui, donor);
        const rebuiltFui = serializeFui(fui, new Map([[destination.descriptor, donorPng]]));
        const reparsedFui = parseFui(rebuiltFui);
        validateHudTargetFui(fuiMapping, reparsedFui);

        const replaced = getFuiImageData(reparsedFui, findFuiImage(reparsedFui, 39));
        expect(inspectPngBytes(replaced)).toMatchObject({ width: 9, height: 9 });
        expect(sha256(replaced)).toBe(sha256(donorPng));
        archiveReplacements.set(fuiMapping.name, rebuiltFui);
      }

      const rebuiltArchive = serializeArc(archive, archiveReplacements);
      expect(sha256(rebuiltArchive)).not.toBe(reference.sha256);
      const reparsedArchive = parseArc(rebuiltArchive);
      expect(reparsedArchive.entries).toHaveLength(archive.entries.length);
      for (const fuiMapping of mapping.fuis) {
        const entry = findArcEntry(reparsedArchive, fuiMapping.name);
        expect(entry).toBeDefined();
        validateHudTargetFui(fuiMapping, parseFui(getArcEntryData(reparsedArchive, entry)));
      }
    });
  }
});
