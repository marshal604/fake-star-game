import { signSuman } from './sign-suman';
import type { EventGraph } from '~/core/types';

export const EVENTS: Record<string, EventGraph> = {
  'sign-suman': signSuman,
};
