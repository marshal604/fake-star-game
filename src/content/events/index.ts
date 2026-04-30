import { signSuman } from './sign-suman';
import type { EventGraph } from '~/core/types';

const orphanageExitStub: EventGraph = {
  start: { type: 'end', reason: '(育幼院線即將開放,敬請期待 v0.3)' },
};

export const EVENTS: Record<string, EventGraph> = {
  'sign-suman': signSuman,
  'orphanage-exit-stub': orphanageExitStub,
};
