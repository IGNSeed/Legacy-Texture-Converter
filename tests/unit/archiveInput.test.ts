import { gzipSync } from 'node:zlib';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import type { ArchiveErrorCode } from '../../src/core/files/archiveErrors';
import { detectArchiveFormat } from '../../src/core/files/archiveFormat';
import { readDroppedItems } from '../../src/core/files/readDroppedItems';
import { readInputFiles } from '../../src/core/files/readInputFiles';
import { UnsafeArchivePathError } from '../../src/core/files/normalizeArchivePath';
import {
  createTarFixture,
  passwordProtectedRar4Fixture,
  rar4Fixture,
  rar5Fixture,
} from '../helpers/archiveFixtures';

const packEntries = [
  { path: 'MyPack/', type: 'directory' as const },
  { path: 'MyPack/pack.mcmeta', content: '{"pack":{"pack_format":15}}' },
  {
    path: 'MyPack/assets/minecraft/textures/block/stone.png',
    content: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  },
  {
    path: 'MyPack/link.png',
    type: 'symlink' as const,
    linkPath: 'assets/minecraft/textures/block/stone.png',
  },
  {
    path: 'MyPack/hardlink.png',
    type: 'hardlink' as const,
    linkPath: 'MyPack/assets/minecraft/textures/block/stone.png',
  },
] as const;

function file(bytes: Blob | string | Uint8Array, name: string): File {
  const content = bytes instanceof Uint8Array ? Uint8Array.from(bytes).buffer : bytes;
  return new File([content], name);
}

function archiveError(code: ArchiveErrorCode): { code: ArchiveErrorCode } {
  return { code };
}

function droppedFiles(files: readonly File[]): DataTransfer {
  return {
    files,
    items: files.map((selectedFile) => ({
      webkitGetAsEntry: () => ({
        isFile: true,
        isDirectory: false,
        name: selectedFile.name,
        fullPath: `/${selectedFile.name}`,
        file: (success: (file: File) => void) => success(selectedFile),
      }),
    })),
  } as unknown as DataTransfer;
}

function droppedFolder(): DataTransfer {
  let readCount = 0;
  const childFile = file('png', 'stone.png');
  const child = {
    isFile: true,
    isDirectory: false,
    name: childFile.name,
    fullPath: '/MyPack/assets/minecraft/textures/block/stone.png',
    file: (success: (file: File) => void) => success(childFile),
  };
  const root = {
    isFile: false,
    isDirectory: true,
    name: 'MyPack',
    fullPath: '/MyPack',
    createReader: () => ({
      readEntries: (success: (entries: unknown[]) => void) => {
        success(readCount++ === 0 ? [child] : []);
      },
    }),
  };
  return {
    files: [],
    items: [{ webkitGetAsEntry: () => root }],
  } as unknown as DataTransfer;
}

describe('archive input', () => {
  it.each(['pack.zip', 'pack.mcpack'])('keeps %s on the JSZip input path', async (name) => {
    const archive = new JSZip();
    archive.file('MyPack/pack.mcmeta', '{"pack":{"pack_format":15}}');
    archive.file('MyPack/assets/minecraft/textures/block/stone.png', 'png');
    const result = await readInputFiles([
      file(await archive.generateAsync({ type: 'blob' }), name),
    ]);

    expect(result.name).toBe(name);
    expect(result.files.map((entry) => entry.path)).toEqual([
      'MyPack/pack.mcmeta',
      'MyPack/assets/minecraft/textures/block/stone.png',
    ]);
  });

  it('detects archive magic while retaining MCPACK as ZIP-compatible', async () => {
    const archive = new JSZip();
    archive.file('pack.mcmeta', '{}');
    const zip = await archive.generateAsync({ type: 'blob' });
    expect(await detectArchiveFormat(file(zip, 'pack.mcpack'))).toBe('zip');
    expect(await detectArchiveFormat(file(rar5Fixture, 'pack.bin'))).toBe('rar');
  });

  it('reads TAR files, keeps paths and blobs, and ignores link and directory entries', async () => {
    const result = await readInputFiles([file(createTarFixture(packEntries), 'pack.tar')]);
    expect(result.files.map((entry) => entry.path)).toEqual([
      'MyPack/pack.mcmeta',
      'MyPack/assets/minecraft/textures/block/stone.png',
    ]);
    expect(await result.files[0].blob.text()).toContain('pack_format');
  });

  it.each(['pack.tar.gz', 'pack.tgz'])('reads %s through gzip and TAR extraction', async (name) => {
    const tar = createTarFixture(packEntries);
    const compressed = Uint8Array.from(gzipSync(tar));
    const result = await readInputFiles([file(compressed, name)]);
    expect(result.files.map((entry) => entry.path)).toContain(
      'MyPack/assets/minecraft/textures/block/stone.png',
    );
  });

  it('routes dropped archives through the same reader and preserves folder drops', async () => {
    const tarFile = file(createTarFixture(packEntries), 'pack.tar');
    const archiveResult = await readDroppedItems(droppedFiles([tarFile]));
    expect(archiveResult.files.map((entry) => entry.path)).toContain('MyPack/pack.mcmeta');

    const folderResult = await readDroppedItems(droppedFolder());
    expect(folderResult).toMatchObject({
      name: 'MyPack',
      files: [{ path: 'MyPack/assets/minecraft/textures/block/stone.png' }],
    });
  });

  it.each([
    ['RAR4', rar4Fixture],
    ['RAR5', rar5Fixture],
  ])('reads %s archives with normalized file paths', async (_label, fixture) => {
    const result = await readInputFiles([file(fixture, 'pack.rar')]);
    expect(result.files.map((entry) => entry.path)).toEqual([
      'example/README.md',
      'example/dir/symlink',
      'example/dir/image.png',
    ]);
    expect(await result.files[0].blob.text()).toContain('# example');
  });

  it('rejects unsafe TAR entry paths through the shared path normalizer', async () => {
    const archive = createTarFixture([{ path: '../../evil.png', content: 'bad' }]);
    await expect(readInputFiles([file(archive, 'unsafe.tar')])).rejects.toBeInstanceOf(
      UnsafeArchivePathError,
    );
  });

  it('reports corrupt and empty archives separately', async () => {
    await expect(readInputFiles([file('not a rar', 'broken.rar')])).rejects.toMatchObject(
      archiveError('archive-corrupt'),
    );
    await expect(readInputFiles([file('not a tar', 'broken.tar')])).rejects.toMatchObject(
      archiveError('archive-corrupt'),
    );
    await expect(readInputFiles([file(new Uint8Array(1024), 'empty.tar')])).rejects.toMatchObject(
      archiveError('archive-empty'),
    );

    const emptyZip = await new JSZip().generateAsync({ type: 'blob' });
    await expect(readInputFiles([file(emptyZip, 'empty.zip')])).rejects.toMatchObject(
      archiveError('archive-empty'),
    );
  });

  it('reports encrypted and multi-volume RAR inputs explicitly', async () => {
    await expect(
      readInputFiles([file(passwordProtectedRar4Fixture, 'protected.rar')]),
    ).rejects.toMatchObject(archiveError('rar-password-protected'));
    await expect(
      readInputFiles([file('', 'pack.part1.rar'), file('', 'pack.part2.rar')]),
    ).rejects.toMatchObject(archiveError('rar-multi-volume'));
    await expect(
      readDroppedItems(droppedFiles([file('', 'pack.part1.rar'), file('', 'pack.part2.rar')])),
    ).rejects.toMatchObject(archiveError('rar-multi-volume'));
    await expect(readInputFiles([file('', 'pack.r00')])).rejects.toMatchObject(
      archiveError('rar-multi-volume'),
    );

    const rar4Volume = Uint8Array.from(rar4Fixture);
    rar4Volume[10] |= 0x01;
    await expect(readInputFiles([file(rar4Volume, 'volume.rar')])).rejects.toMatchObject(
      archiveError('rar-multi-volume'),
    );

    const rar5Volume = Uint8Array.from(rar5Fixture);
    rar5Volume[16] |= 0x01;
    await expect(readInputFiles([file(rar5Volume, 'volume5.rar')])).rejects.toMatchObject(
      archiveError('rar-multi-volume'),
    );
  });

  it.each(['pack.tar.bz2', 'pack.tbz2', 'pack.tar.xz', 'pack.txz'])(
    'reports unsupported compressed TAR input %s',
    async (name) => {
      await expect(readInputFiles([file('', name)])).rejects.toMatchObject(
        archiveError('archive-unsupported'),
      );
    },
  );

  it('rejects a known archive whose extension conflicts with its magic bytes', async () => {
    const archive = new JSZip();
    archive.file('pack.mcmeta', '{}');
    const zip = await archive.generateAsync({ type: 'blob' });
    await expect(readInputFiles([file(zip, 'mismatch.rar')])).rejects.toMatchObject(
      archiveError('archive-unsupported'),
    );
  });

  it('rejects an unsafe ZIP path before exposing its content', async () => {
    const archive = new JSZip();
    archive.file('../../evil.png', 'bad');
    const zip = await archive.generateAsync({ type: 'blob' });
    await expect(readInputFiles([file(zip, 'unsafe.zip')])).rejects.toBeInstanceOf(
      UnsafeArchivePathError,
    );
  });
});
