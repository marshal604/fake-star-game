import { mainStory } from './main-story';
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

const setExitStub: EventGraph = {
  start: { type: 'end', reason: '(永振片場劇情即將開放)' },
};

const officeGoOrphanage: EventGraph = {
  start: {
    type: 'narration',
    text: '(嘟嘟嘟——電話響了)\n\n「喂?好,我這就過去。」',
    next: 'walking',
  },
  walking: {
    type: 'narration',
    text: '你出了辦公室,走到了育幼院。',
    next: 'enter',
  },
  enter: {
    type: 'enterMap',
    mapId: 'orphanage',
    x: 7,
    y: 8,
    facing: 'up',
  },
};

export const EVENTS: Record<string, EventGraph> = {
  'main-story': mainStory,
  'sign-suman': signSuman,
  'orphanage-exit-stub': orphanageExitStub,
  'obo-exit-stub': oboExitStub,
  'pub-exit-stub': pubExitStub,
  'set-exit-stub': setExitStub,
  'office-go-orphanage': officeGoOrphanage,
};
