import sourceJson from '../../../data/mappings/common/gui-hud-sources.json';
import switchJson from '../../../data/mappings/switch/gui-hud.json';
import wiiuJson from '../../../data/mappings/wiiu/gui-hud.json';
import type { TargetEdition } from '../../types/conversion';
import type { HudSourceMappingDocument, HudTargetMappingDocument } from './types';

export const hudSourceMappings: HudSourceMappingDocument = sourceJson;

const targetMappings: Record<TargetEdition, HudTargetMappingDocument> = {
  wiiu: wiiuJson as HudTargetMappingDocument,
  switch: switchJson as HudTargetMappingDocument,
};

export function hudTargetMapping(target: TargetEdition): HudTargetMappingDocument {
  return targetMappings[target];
}
