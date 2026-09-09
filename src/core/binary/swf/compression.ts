import { MAX_BINARY_FILE_SIZE } from '../bounds';

async function transform(
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream,
  label: string,
): Promise<Uint8Array> {
  const input = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice());
      controller.close();
    },
  });
  const transformStream = stream as unknown as ReadableWritablePair<
    Uint8Array<ArrayBuffer>,
    Uint8Array<ArrayBuffer>
  >;
  const output = await new Response(input.pipeThrough(transformStream)).arrayBuffer();
  if (output.byteLength === 0 || output.byteLength > MAX_BINARY_FILE_SIZE) {
    throw new Error(`swf:${label}-size`);
  }
  return new Uint8Array(output);
}

export async function inflateZlib(bytes: Uint8Array): Promise<Uint8Array> {
  try {
    return await transform(bytes, new DecompressionStream('deflate'), 'inflate');
  } catch {
    throw new Error('swf:zlib-inflate');
  }
}

export async function deflateZlib(bytes: Uint8Array): Promise<Uint8Array> {
  try {
    return await transform(bytes, new CompressionStream('deflate'), 'deflate');
  } catch {
    throw new Error('swf:zlib-deflate');
  }
}
