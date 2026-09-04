export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

export async function decodeImage(blob: Blob): Promise<DecodedImage> {
  if ('createImageBitmap' in globalThis) {
    const bitmap = await createImageBitmap(blob);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(blob);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('png-decode-failed'));
      image.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function inspectImage(blob: Blob): Promise<{ width: number; height: number }> {
  const image = await decodeImage(blob);
  try {
    return { width: image.width, height: image.height };
  } finally {
    image.close();
  }
}
