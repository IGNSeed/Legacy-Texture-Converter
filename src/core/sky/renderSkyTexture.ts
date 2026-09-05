import type { DecodedImage } from '../image/decodeImage';
import { canvasToPng, createCanvas, getCanvasContext } from '../image/canvas';
import { BEDROCK_CUBEMAP_LAYOUT } from './selectSkySource';

export const LCE_SKY_WIDTH = 4032;
export const LCE_SKY_HEIGHT = 2688;

function skyContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = getCanvasContext(canvas);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return context;
}

export async function renderJavaSky(image: DecodedImage): Promise<Blob> {
  const output = createCanvas(LCE_SKY_WIDTH, LCE_SKY_HEIGHT);
  const context = skyContext(output);
  context.drawImage(
    image.source,
    0,
    0,
    image.width,
    image.height,
    0,
    0,
    LCE_SKY_WIDTH,
    LCE_SKY_HEIGHT,
  );
  return canvasToPng(output);
}

export async function renderBedrockSky(faces: readonly DecodedImage[]): Promise<Blob> {
  const faceWidth = faces[0]?.width;
  const faceHeight = faces[0]?.height;
  if (!faceWidth || !faceHeight || faces.length !== 6) throw new Error('sky-face-set-invalid');

  const sheet = createCanvas(faceWidth * 3, faceHeight * 2);
  const sheetContext = skyContext(sheet);
  for (let row = 0; row < BEDROCK_CUBEMAP_LAYOUT.length; row += 1) {
    const layoutRow = BEDROCK_CUBEMAP_LAYOUT[row];
    for (let column = 0; column < layoutRow.length; column += 1) {
      const face = faces[layoutRow[column]];
      if (!face) throw new Error('sky-face-missing');
      sheetContext.drawImage(
        face.source,
        0,
        0,
        face.width,
        face.height,
        column * faceWidth,
        row * faceHeight,
        faceWidth,
        faceHeight,
      );
    }
  }

  const output = createCanvas(LCE_SKY_WIDTH, LCE_SKY_HEIGHT);
  const outputContext = skyContext(output);
  outputContext.drawImage(
    sheet,
    0,
    0,
    sheet.width,
    sheet.height,
    0,
    0,
    LCE_SKY_WIDTH,
    LCE_SKY_HEIGHT,
  );
  return canvasToPng(output);
}
