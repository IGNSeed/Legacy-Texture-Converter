import sourceJson from '../../../data/mappings/common/gui-hud-sources.json';
import ps3OldJson from '../../../data/mappings/ps3/1.8/gui-hud.json';
import ps3LatestJson from '../../../data/mappings/ps3/latest/gui-hud.json';
import switchJson from '../../../data/mappings/switch/gui-hud.json';
import wiiuJson from '../../../data/mappings/wiiu/gui-hud.json';
import type { Ps3Version, TargetEdition } from '../../types/conversion';
import type {
  HudSourceMappingDocument,
  HudTargetFuiMappingDocument,
  HudTargetMappingDocument,
} from './types';

export const hudSourceMappings: HudSourceMappingDocument = sourceJson;

function fuiMapping(value: unknown): HudTargetMappingDocument {
  return { ...(value as object), backend: 'fui' } as HudTargetMappingDocument;
}

const targetMappings = {
  wiiu: fuiMapping(wiiuJson),
  switch: fuiMapping(switchJson),
  'ps3-latest': fuiMapping(ps3LatestJson),
  'ps3-1.8': ps3OldJson as HudTargetMappingDocument,
};

export function hudTargetMapping(target: 'wiiu' | 'switch'): HudTargetFuiMappingDocument;
export function hudTargetMapping(target: 'ps3', ps3Version: Ps3Version): HudTargetMappingDocument;
export function hudTargetMapping(
  target: TargetEdition,
  ps3Version?: Ps3Version,
): HudTargetMappingDocument;
export function hudTargetMapping(
  target: TargetEdition,
  ps3Version?: Ps3Version,
): HudTargetMappingDocument {
  if (target !== 'ps3') return targetMappings[target];
  if (!ps3Version) throw new Error('ps3-version-required');
  return targetMappings[ps3Version === 'latest' ? 'ps3-latest' : 'ps3-1.8'];
}
