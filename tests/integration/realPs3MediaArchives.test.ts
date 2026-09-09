import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findArcEntry, getArcEntryData, parseArc, serializeArc } from '../../src/core/binary/arc';
import { findFuiImage, getFuiImageData, parseFui, serializeFui } from '../../src/core/binary/fui';
import { findSwfBitmap, getSwfBitmapData, parseSwf, serializeSwf } from '../../src/core/binary/swf';
import { hudTargetMapping } from '../../src/core/gui-hud/mappings';
import { validateHudTargetFui, validateHudTargetSwf } from '../../src/core/gui-hud/validation';

const latestPath = resolve('References/ps3/1.13 PS3 Common/1.13 Common/Common/Media/MediaPS3.arc');
const oldPath = resolve('References/ps3/1.8 Common/Common/Media/MediaPS3.arc');

function hash(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

async function referencesAvailable() {
  try {
    await Promise.all([access(latestPath), access(oldPath)]);
    return true;
  } catch {
    return false;
  }
}

describe.skipIf(!(await referencesAvailable()))('actual PS3 Media ARC integration', () => {
  it('validates and rebuilds the Latest FUI archive', async () => {
    const bytes = new Uint8Array(await readFile(latestPath));
    expect(bytes.byteLength).toBe(29_538_242);
    expect(hash(bytes)).toBe('55e0b05547ecbb99cba1af07f0cd17b259645df5f96c9c759c4356f1f959d05d');
    const archive = parseArc(bytes);
    expect(archive.entries).toHaveLength(571);
    const mapping = hudTargetMapping('ps3', 'latest');
    expect(mapping.backend).toBe('fui');
    if (mapping.backend !== 'fui') throw new Error('expected FUI mapping');
    const target = mapping.fuis[0];
    const entry = findArcEntry(archive, target.name)!;
    const fui = parseFui(getArcEntryData(archive, entry));
    validateHudTargetFui(target, fui);
    const destination = findFuiImage(fui, target.entries[0].descriptor)!;
    const donor = findFuiImage(fui, target.entries[1].descriptor)!;
    const rebuiltFui = serializeFui(
      fui,
      new Map([[destination.descriptor, getFuiImageData(fui, donor)]]),
    );
    const rebuiltArc = parseArc(serializeArc(archive, new Map([[target.name, rebuiltFui]])));
    expect(rebuiltArc.entries).toHaveLength(archive.entries.length);
    validateHudTargetFui(
      target,
      parseFui(getArcEntryData(rebuiltArc, findArcEntry(rebuiltArc, target.name)!)),
    );
  });

  it('validates CWS SWF 9 and replaces only a mapped lossless bitmap in the 1.8 archive', async () => {
    const bytes = new Uint8Array(await readFile(oldPath));
    expect(bytes.byteLength).toBe(10_678_972);
    expect(hash(bytes)).toBe('450583da28484acb5c25bdd2c1c725f9414f6d01a41b4f2e52f9d515786b210a');
    const archive = parseArc(bytes);
    expect(archive.entries).toHaveLength(212);
    const mapping = hudTargetMapping('ps3', '1.8');
    expect(mapping.backend).toBe('swf');
    if (mapping.backend !== 'swf') throw new Error('expected SWF mapping');
    const target = mapping.swfs[0];
    const entry = findArcEntry(archive, target.name)!;
    const swfBytes = getArcEntryData(archive, entry);
    expect(hash(swfBytes)).toBe('7bb7b49689da81ccc4728e6b75987c242f49803dcd8af3977e4e69631df5356b');
    const swf = await parseSwf(swfBytes);
    await validateHudTargetSwf(target, swf);
    expect(swf.signature).toBe('CWS');
    expect(swf.tags.filter((tag) => tag.code === 36)).toHaveLength(53);
    expect(await serializeSwf(swf, new Map())).toEqual(swfBytes);

    const mapped = target.entries[0];
    const rgba = new Uint8Array(mapped.width * mapped.height * 4);
    rgba.fill(255);
    const rebuiltSwfBytes = await serializeSwf(
      swf,
      new Map([[mapped.bitmapId, { width: mapped.width, height: mapped.height, rgba }]]),
    );
    const rebuiltSwf = await parseSwf(rebuiltSwfBytes);
    await validateHudTargetSwf(target, rebuiltSwf);
    const rebuiltBitmap = findSwfBitmap(rebuiltSwf, mapped.bitmapId)!;
    expect((await getSwfBitmapData(rebuiltSwf, rebuiltBitmap)).rgba).toEqual(rgba);

    const rebuiltArchive = parseArc(
      serializeArc(archive, new Map([[target.name, rebuiltSwfBytes]])),
    );
    expect(rebuiltArchive.entries).toHaveLength(archive.entries.length);
    const rebuiltEntry = findArcEntry(rebuiltArchive, target.name)!;
    await validateHudTargetSwf(
      target,
      await parseSwf(getArcEntryData(rebuiltArchive, rebuiltEntry)),
    );
  });
});
