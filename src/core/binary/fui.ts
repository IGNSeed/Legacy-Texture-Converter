import { MAX_BINARY_FILE_SIZE, assertBinaryLength, assertRange, dataView } from './bounds';
import { findPngSignature, inspectPngBytes } from './png';

export const FUI_IMAGE_DESCRIPTOR_SIZE = 32;
export const FUI_SIZE_BIAS = 152;
const FUI_SIZE_FIELD_OFFSET = 8;
const MAX_FUI_IMAGES = 4_096;

export interface FuiImageDescriptor {
  index: number;
  tableOffset: number;
  descriptor: number;
  attribute: number;
  width: number;
  height: number;
  imageOffset: number;
  imageSize: number;
  unknownOffset: number;
  unknown1c: number;
}

export interface ParsedFui {
  bytes: Uint8Array;
  descriptorTableOffset: number;
  imageDataOffset: number;
  images: readonly FuiImageDescriptor[];
}

function descriptorAt(view: DataView, tableOffset: number, index: number): FuiImageDescriptor {
  return {
    index,
    tableOffset,
    descriptor: view.getUint32(tableOffset, true),
    attribute: view.getUint32(tableOffset + 4, true),
    width: view.getUint32(tableOffset + 8, true),
    height: view.getUint32(tableOffset + 12, true),
    imageOffset: view.getUint32(tableOffset + 16, true),
    imageSize: view.getUint32(tableOffset + 20, true),
    unknownOffset: view.getUint32(tableOffset + 24, true),
    unknown1c: view.getUint32(tableOffset + 28, true),
  };
}

export function parseFui(bytes: Uint8Array): ParsedFui {
  assertBinaryLength(bytes, 'fui');
  assertRange(0, FUI_SIZE_BIAS, bytes.byteLength, 'fui:header');
  if (bytes[1] !== 0x49 || bytes[2] !== 0x55 || bytes[3] !== 0x46) {
    throw new Error('fui:invalid-signature');
  }
  const view = dataView(bytes);
  if (view.getUint32(FUI_SIZE_FIELD_OFFSET, true) !== bytes.byteLength - FUI_SIZE_BIAS) {
    throw new Error('fui:invalid-size-field');
  }

  const imageDataOffset = findPngSignature(bytes);
  if (imageDataOffset < FUI_IMAGE_DESCRIPTOR_SIZE) throw new Error('fui:missing-images');

  const reverseDescriptors: FuiImageDescriptor[] = [];
  let tableOffset = imageDataOffset - FUI_IMAGE_DESCRIPTOR_SIZE;
  for (let count = 0; count < MAX_FUI_IMAGES; count += 1) {
    assertRange(tableOffset, FUI_IMAGE_DESCRIPTOR_SIZE, imageDataOffset, 'fui:descriptor');
    const descriptor = descriptorAt(view, tableOffset, 0);
    if (
      descriptor.width === 0 ||
      descriptor.height === 0 ||
      descriptor.width > 16_384 ||
      descriptor.height > 16_384 ||
      descriptor.imageSize < 20
    ) {
      throw new Error('fui:invalid-descriptor');
    }
    reverseDescriptors.push(descriptor);
    if (descriptor.imageOffset === 0) break;
    tableOffset -= FUI_IMAGE_DESCRIPTOR_SIZE;
  }
  if (reverseDescriptors.at(-1)?.imageOffset !== 0) throw new Error('fui:too-many-images');

  const images = reverseDescriptors.reverse().map((descriptor, index) => ({
    ...descriptor,
    index,
  }));
  const ids = new Set<number>();
  let expectedImageOffset = 0;
  for (const image of images) {
    if (ids.has(image.descriptor)) throw new Error('fui:duplicate-descriptor');
    ids.add(image.descriptor);
    if (image.imageOffset !== expectedImageOffset) throw new Error('fui:overlapping-images');
    const absoluteOffset = imageDataOffset + image.imageOffset;
    assertRange(absoluteOffset, image.imageSize, bytes.byteLength, 'fui:image');
    const metadata = inspectPngBytes(
      bytes.subarray(absoluteOffset, absoluteOffset + image.imageSize),
    );
    if (metadata.width !== image.width || metadata.height !== image.height) {
      throw new Error('fui:image-dimensions-mismatch');
    }
    expectedImageOffset += image.imageSize;
  }
  if (imageDataOffset + expectedImageOffset !== bytes.byteLength) {
    throw new Error('fui:trailing-image-data');
  }

  return { bytes, descriptorTableOffset: tableOffset, imageDataOffset, images };
}

export function findFuiImage(fui: ParsedFui, descriptor: number): FuiImageDescriptor | undefined {
  return fui.images.find((image) => image.descriptor === descriptor);
}

export function getFuiImageData(fui: ParsedFui, image: FuiImageDescriptor): Uint8Array {
  const offset = fui.imageDataOffset + image.imageOffset;
  return fui.bytes.subarray(offset, offset + image.imageSize);
}

function writeDescriptor(
  view: DataView,
  offset: number,
  descriptor: FuiImageDescriptor,
  width: number,
  height: number,
  imageOffset: number,
  imageSize: number,
): void {
  view.setUint32(offset, descriptor.descriptor, true);
  view.setUint32(offset + 4, descriptor.attribute, true);
  view.setUint32(offset + 8, width, true);
  view.setUint32(offset + 12, height, true);
  view.setUint32(offset + 16, imageOffset, true);
  view.setUint32(offset + 20, imageSize, true);
  view.setUint32(offset + 24, descriptor.unknownOffset, true);
  view.setUint32(offset + 28, descriptor.unknown1c, true);
}

export function serializeFui(
  fui: ParsedFui,
  replacements: ReadonlyMap<number, Uint8Array>,
): Uint8Array {
  const knownDescriptors = new Set(fui.images.map((image) => image.descriptor));
  for (const descriptor of replacements.keys()) {
    if (!knownDescriptors.has(descriptor)) throw new Error('fui:replacement-image-missing');
  }

  const imageData = fui.images.map((image) => {
    const replacement = replacements.get(image.descriptor);
    const data = replacement ?? getFuiImageData(fui, image);
    const metadata = inspectPngBytes(data);
    return { data, metadata };
  });
  const payloadSize = imageData.reduce((total, image) => total + image.data.byteLength, 0);
  const outputLength = fui.imageDataOffset + payloadSize;
  if (!Number.isSafeInteger(outputLength) || outputLength > MAX_BINARY_FILE_SIZE) {
    throw new Error('fui:output-too-large');
  }

  const output = new Uint8Array(outputLength);
  output.set(fui.bytes.subarray(0, fui.descriptorTableOffset), 0);
  const view = dataView(output);
  view.setUint32(FUI_SIZE_FIELD_OFFSET, outputLength - FUI_SIZE_BIAS, true);

  let descriptorCursor = fui.descriptorTableOffset;
  let imageCursor = 0;
  fui.images.forEach((descriptor, index) => {
    const image = imageData[index];
    if (!image) throw new Error('fui:serialize-image-missing');
    writeDescriptor(
      view,
      descriptorCursor,
      descriptor,
      image.metadata.width,
      image.metadata.height,
      imageCursor,
      image.data.byteLength,
    );
    descriptorCursor += FUI_IMAGE_DESCRIPTOR_SIZE;
    output.set(image.data, fui.imageDataOffset + imageCursor);
    imageCursor += image.data.byteLength;
  });

  if (
    descriptorCursor !== fui.imageDataOffset ||
    fui.imageDataOffset + imageCursor !== outputLength
  ) {
    throw new Error('fui:serialize-size-mismatch');
  }
  return output;
}
