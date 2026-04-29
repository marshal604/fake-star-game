import { create } from 'zustand';
import type { GameMode } from '~/core/types';

interface GameState {
  flags: Record<string, boolean | number | string>;
  mode: GameMode;
  setFlag: (key: string, value: boolean | number | string) => void;
  setMode: (mode: GameMode) => void;
}

export const useGameStore = create<GameState>((set) => ({
  flags: {},
  mode: { kind: 'tilemap', mapId: 'office' },
  setFlag: (key, value) =>
    set((state) => ({
      flags: { ...state.flags, [key]: value },
    })),
  setMode: (mode) => set({ mode }),
}));
