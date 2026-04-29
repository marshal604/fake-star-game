import type { SpeakerId } from '~/core/types';

export const CHARACTERS: Record<
  SpeakerId,
  { displayName: string; portraitUrl: (e?: string) => string; spriteUrl: string }
> = {
  protagonist: {
    displayName: '主角',
    portraitUrl: () => '/portraits/protagonist-normal.png',
    spriteUrl: '/sprites/protagonist.png',
  },
  suman: {
    displayName: '蘇嫚君',
    portraitUrl: () => '/portraits/suman-normal.png',
    spriteUrl: '/sprites/suman.png',
  },
  chenyifu: {
    displayName: '陳以復',
    portraitUrl: () => '/portraits/chenyifu-normal.png',
    spriteUrl: '/sprites/chenyifu.png',
  },
};
