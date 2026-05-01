import { signSuman } from './sign-suman';
import type { EventGraph } from '~/core/types';

const orphanageExitStub: EventGraph = {
  start: { type: 'end', reason: '(育幼院線即將開放,敬請期待 v0.3)' },
};

const oboExitStub: EventGraph = {
  start: { type: 'end', reason: '(歐堡娛樂城劇情即將開放)' },
};

const pubExitStub: EventGraph = {
  start: { type: 'end', reason: '(19號酒館劇情即將開放)' },
};

export const EVENTS: Record<string, EventGraph> = {
  'sign-suman': signSuman,
  'orphanage-exit-stub': orphanageExitStub,
  'obo-exit-stub': oboExitStub,
  'pub-exit-stub': pubExitStub,
};
