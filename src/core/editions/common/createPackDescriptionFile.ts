import type { OutputFile } from '../../../types/conversion';

export function createPackDescriptionFile(
  description: string | undefined,
  destination: string,
): OutputFile | undefined {
  if (description === undefined || description.trim().length === 0) return undefined;
  return {
    path: destination,
    blob: new Blob([description], { type: 'text/plain;charset=utf-8' }),
  };
}
