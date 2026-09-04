import { canvasToPng, createCanvas, getCanvasContext } from './canvas';
import { decodeImage } from './decodeImage';

export async function resizePixelTexture(blob: Blob, width: number, height: number): Promise<Blob> {
  const image = await decodeImage(blob);
  try {
    const canvas = createCanvas(width, height);
    const context = getCanvasContext(canvas);
    context.clearRect(0, 0, width, height);
    context.drawImage(image.source, 0, 0, image.width, image.height, 0, 0, width, height);
    return await canvasToPng(canvas);
  } finally {
    image.close();
  }
}
