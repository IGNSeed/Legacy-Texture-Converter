import type { TargetEditionAdapter } from '../common/TargetEditionAdapter';
import { convertWiiUPack } from './convertWiiUPack';

export const wiiuAdapter: TargetEditionAdapter = {
  id: 'wiiu',
  convert: convertWiiUPack,
};
