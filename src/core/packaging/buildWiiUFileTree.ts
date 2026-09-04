import type { OutputFile } from '../../types/conversion';
import { mergeOutputFiles } from './mergeOutputFiles';

export function buildWiiUFileTree(
  defaults: readonly OutputFile[],
  overrides: readonly OutputFile[],
): OutputFile[] {
  return mergeOutputFiles(defaults, overrides);
}
