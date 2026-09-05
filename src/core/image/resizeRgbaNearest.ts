export function resizeRgbaNearest(
  source: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): Uint8ClampedArray {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    targetWidth <= 0 ||
    targetHeight <= 0 ||
    source.length !== sourceWidth * sourceHeight * 4
  ) {
    throw new Error('rgba-resize-invalid-dimensions');
  }

  const output = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  for (let targetY = 0; targetY < targetHeight; targetY += 1) {
    const sourceY = Math.min(sourceHeight - 1, Math.floor((targetY * sourceHeight) / targetHeight));
    for (let targetX = 0; targetX < targetWidth; targetX += 1) {
      const sourceX = Math.min(sourceWidth - 1, Math.floor((targetX * sourceWidth) / targetWidth));
      const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
      const targetIndex = (targetY * targetWidth + targetX) * 4;
      output[targetIndex] = source[sourceIndex];
      output[targetIndex + 1] = source[sourceIndex + 1];
      output[targetIndex + 2] = source[sourceIndex + 2];
      output[targetIndex + 3] = source[sourceIndex + 3];
    }
  }
  return output;
}

export function swapRedBlueChannels(rgba: Uint8ClampedArray): Uint8ClampedArray {
  if (rgba.length % 4 !== 0) throw new Error('rgba-invalid-length');
  const output = rgba.slice();
  for (let index = 0; index < output.length; index += 4) {
    const red = output[index] ?? 0;
    output[index] = output[index + 2] ?? 0;
    output[index + 2] = red;
  }
  return output;
}
