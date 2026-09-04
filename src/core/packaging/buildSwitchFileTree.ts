import type { OutputFile } from '../../types/conversion';
import { SWITCH_ATMOSPHERE_PREFIX } from '../editions/switch/paths';
import { mergeOutputFiles } from './mergeOutputFiles';

export function buildSwitchFileTree(
  defaults: readonly OutputFile[],
  overrides: readonly OutputFile[],
): OutputFile[] {
  return mergeOutputFiles(defaults, overrides).map((file) => ({
    path: `${SWITCH_ATMOSPHERE_PREFIX}/${file.path}`,
    blob: file.blob,
  }));
}
