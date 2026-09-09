import type { Ps3Version, TargetEdition } from '../../types/conversion';
import type { TargetEditionAdapter } from './common/TargetEditionAdapter';
import { ps3Adapter } from './ps3/ps3Adapter';
import { switchAdapter } from './switch/switchAdapter';
import { wiiuAdapter } from './wiiu/wiiuAdapter';

const adapters: Record<Exclude<TargetEdition, 'ps3'>, TargetEditionAdapter> = {
  wiiu: wiiuAdapter,
  switch: switchAdapter,
};

export type TargetAdapterKey = 'wiiu' | 'switch' | 'ps3-latest' | 'ps3-1.8';

export function targetAdapterKey(target: TargetEdition, ps3Version?: Ps3Version): TargetAdapterKey {
  if (target !== 'ps3') return target;
  if (!ps3Version) throw new Error('ps3-version-required');
  return ps3Version === 'latest' ? 'ps3-latest' : 'ps3-1.8';
}

export function targetEditionAdapter(
  target: TargetEdition,
  ps3Version?: Ps3Version,
): TargetEditionAdapter {
  return target === 'ps3' ? ps3Adapter(ps3Version) : adapters[target];
}
