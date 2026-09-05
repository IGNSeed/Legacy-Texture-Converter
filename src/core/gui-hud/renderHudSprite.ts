import type { DecodedImage } from '../image/decodeImage';
import { canvasToPng, createCanvas, getCanvasContext } from '../image/canvas';
import { resizeRgbaNearest, swapRedBlueChannels } from '../image/resizeRgbaNearest';
import type { HudRect } from './types';

export function resolveHudSheetScale(
  width: number,
  height: number,
  logicalSheetSize: number,
): number | undefined {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width !== height ||
    width < logicalSheetSize ||
    width % logicalSheetSize !== 0
  ) {
    return undefined;
  }
  const scale = width / logicalSheetSize;
  return Number.isSafeInteger(scale) && scale <= 16 ? scale : undefined;
}

export async function renderHudSprite(
  sheet: DecodedImage,
  sourceScale: number,
  rect: HudRect,
  targetWidth: number,
  targetHeight: number,
  swapRedBlue: boolean,
): Promise<Blob> {
  const sourceX = rect.x * sourceScale;
  const sourceY = rect.y * sourceScale;
  const sourceWidth = rect.width * sourceScale;
  const sourceHeight = rect.height * sourceScale;
  if (
    sourceX < 0 ||
    sourceY < 0 ||
    sourceX + sourceWidth > sheet.width ||
    sourceY + sourceHeight > sheet.height
  ) {
    throw new Error('hud-source-rect-out-of-bounds');
  }

  const cropCanvas = createCanvas(sourceWidth, sourceHeight);
  const cropContext = getCanvasContext(cropCanvas);
  cropContext.imageSmoothingEnabled = false;
  cropContext.clearRect(0, 0, sourceWidth, sourceHeight);
  cropContext.drawImage(
    sheet.source,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight,
  );
  const sourceRgba = cropContext.getImageData(0, 0, sourceWidth, sourceHeight).data;
  let targetRgba = resizeRgbaNearest(
    sourceRgba,
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
  );
  if (swapRedBlue) targetRgba = swapRedBlueChannels(targetRgba);

  const targetCanvas = createCanvas(targetWidth, targetHeight);
  const targetContext = getCanvasContext(targetCanvas);
  targetContext.imageSmoothingEnabled = false;
  targetContext.clearRect(0, 0, targetWidth, targetHeight);
  const imageData = targetContext.createImageData(targetWidth, targetHeight);
  imageData.data.set(targetRgba);
  targetContext.putImageData(imageData, 0, 0);
  return canvasToPng(targetCanvas);
}
