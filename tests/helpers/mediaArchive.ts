import type { TargetEdition } from '../../src/types/conversion';
import { hudTargetMapping } from '../../src/core/gui-hud/mappings';
import type { HudTargetFuiMapping } from '../../src/core/gui-hud/types';

function pngBytes(width: number, height: number, extraBytes = 0): Uint8Array {
  const ancillarySize = extraBytes > 0 ? extraBytes + 12 : 0;
  const bytes = new Uint8Array(45 + ancillarySize);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13);
  bytes.set([73, 72, 68, 82], 12);
  view.setUint32(16, width);
  view.setUint32(20, height);
  bytes.set([8, 6, 0, 0, 0], 24);
  let cursor = 33;
  if (extraBytes > 0) {
    view.setUint32(cursor, extraBytes);
    bytes.set([116, 69, 88, 116], cursor + 4);
    bytes.fill(65, cursor + 8, cursor + 8 + extraBytes);
    cursor += ancillarySize;
  }
  view.setUint32(cursor, 0);
  bytes.set([73, 69, 78, 68], cursor + 4);
  return bytes;
}

export function syntheticPngBytes(width: number, height: number, extraBytes = 0): Uint8Array {
  return pngBytes(width, height, extraBytes);
}

export function createSyntheticFui(mapping: HudTargetFuiMapping): Uint8Array {
  const descriptorSize = 32;
  const prefixSize = 152;
  const mappedByIndex = new Map(mapping.entries.map((entry) => [entry.index, entry]));
  const images = Array.from({ length: mapping.imageCount }, (_, index) => {
    const mapped = mappedByIndex.get(index);
    return {
      descriptor: mapped?.descriptor ?? 0x1000 + index,
      width: mapped?.width ?? 1,
      height: mapped?.height ?? 1,
      data: pngBytes(mapped?.width ?? 1, mapped?.height ?? 1),
    };
  });
  const imageDataOffset = prefixSize + images.length * descriptorSize;
  const payloadSize = images.reduce((total, image) => total + image.data.byteLength, 0);
  const output = new Uint8Array(imageDataOffset + payloadSize);
  const view = new DataView(output.buffer);
  output.set([1, 73, 85, 70], 0);
  view.setUint32(8, output.byteLength - prefixSize, true);

  let payloadOffset = 0;
  images.forEach((image, index) => {
    const offset = prefixSize + index * descriptorSize;
    view.setUint32(offset, image.descriptor, true);
    view.setUint32(offset + 4, 1, true);
    view.setUint32(offset + 8, image.width, true);
    view.setUint32(offset + 12, image.height, true);
    view.setUint32(offset + 16, payloadOffset, true);
    view.setUint32(offset + 20, image.data.byteLength, true);
    view.setUint32(offset + 24, 0xabc00000 + index, true);
    view.setUint32(offset + 28, 0xdef00000 + index, true);
    output.set(image.data, imageDataOffset + payloadOffset);
    payloadOffset += image.data.byteLength;
  });
  return output;
}

export function createSyntheticArc(entries: readonly [string, Uint8Array][]): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = entries.map(([name, data]) => ({ name: encoder.encode(name), data }));
  const tableSize = 4 + encoded.reduce((total, entry) => total + 2 + entry.name.length + 8, 0);
  const payloadSize = encoded.reduce((total, entry) => total + entry.data.byteLength, 0);
  const output = new Uint8Array(tableSize + payloadSize);
  const view = new DataView(output.buffer);
  view.setUint32(0, encoded.length, false);
  let tableOffset = 4;
  let dataOffset = tableSize;
  for (const entry of encoded) {
    view.setUint16(tableOffset, entry.name.length, false);
    tableOffset += 2;
    output.set(entry.name, tableOffset);
    tableOffset += entry.name.length;
    view.setUint32(tableOffset, dataOffset, false);
    view.setUint32(tableOffset + 4, entry.data.byteLength, false);
    tableOffset += 8;
    output.set(entry.data, dataOffset);
    dataOffset += entry.data.byteLength;
  }
  return output;
}

export function syntheticMediaArchiveBlob(target: TargetEdition): Blob {
  const mapping = hudTargetMapping(target);
  const entries: [string, Uint8Array][] = [
    ['unrelated.bin', new Uint8Array([1, 2, 3, 4])],
    ...mapping.fuis.map((fui): [string, Uint8Array] => [fui.name, createSyntheticFui(fui)]),
  ];
  const bytes = createSyntheticArc(entries);
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
}
