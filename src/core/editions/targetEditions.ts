import type { TargetEdition } from '../../types/conversion';
import type { TargetEditionAdapter } from './common/TargetEditionAdapter';
import { switchAdapter } from './switch/switchAdapter';
import { wiiuAdapter } from './wiiu/wiiuAdapter';

const adapters: Record<TargetEdition, TargetEditionAdapter> = {
  wiiu: wiiuAdapter,
  switch: switchAdapter,
};

export function targetEditionAdapter(target: TargetEdition): TargetEditionAdapter {
  return adapters[target];
}
