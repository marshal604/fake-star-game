import { create } from 'zustand';
import { EVENTS } from '~/content/events';
import officeMap from '~/content/maps/office.json';
import { advance, getNode } from '~/core/runtime';
import { findTrigger, isWalkable } from '~/core/tilemap';
import type { Facing, GameMode, SpeakerId, TilemapData } from '~/core/types';

interface PlayerState {
  mapId: string;
  x: number;
  y: number;
  facing: Facing;
}

interface NpcState {
  mapId: string;
  x: number;
  y: number;
  facing: Facing;
  spriteId: SpeakerId;
}

const MAPS: Record<string, TilemapData> = {
  office: officeMap as TilemapData,
};

const playerSpawn = (officeMap as TilemapData).spawns.player;

function facingFromDelta(dx: number, dy: number, fallback: Facing): Facing {
  if (dy < 0) return 'up';
  if (dx > 0) return 'right';
  if (dy > 0) return 'down';
  if (dx < 0) return 'left';
  return fallback;
}

interface GameState {
  flags: Record<string, boolean | number | string>;
  mode: GameMode;
  player: PlayerState;
  npcs: Record<string, NpcState>;
  currentEventId: string | null;
  currentNodeId: string | null;
  setFlag: (key: string, value: boolean | number | string) => void;
  setMode: (mode: GameMode) => void;
  movePlayer: (dx: number, dy: number) => void;
  facePlayer: (facing: Facing) => void;
  spawnNpc: (
    npcId: string,
    spriteId: SpeakerId,
    mapId: string,
    x: number,
    y: number,
    facing: Facing,
  ) => void;
  enterEvent: (eventId: string) => void;
  goToEvent: (eventId: string, nodeId?: string) => void;
  exitToMap: (mapId: string, x: number, y: number, facing: Facing) => void;
  endGame: (reason: string) => void;
  advanceNode: (choice?: number) => void;
  chooseOption: (index: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  flags: {},
  mode: { kind: 'tilemap', mapId: 'office' },
  player: {
    mapId: 'office',
    x: playerSpawn.x,
    y: playerSpawn.y,
    facing: playerSpawn.facing,
  },
  npcs: {},
  currentEventId: null,
  currentNodeId: null,
  setFlag: (key, value) =>
    set((state) => ({
      flags: { ...state.flags, [key]: value },
    })),
  setMode: (mode) => set({ mode }),
  movePlayer: (dx, dy) =>
    set((state) => {
      if (state.mode.kind !== 'tilemap') {
        return {};
      }

      const facing = facingFromDelta(dx, dy, state.player.facing);
      const map = MAPS[state.player.mapId];
      if (!map) {
        return { player: { ...state.player, facing } };
      }

      const nextX = state.player.x + dx;
      const nextY = state.player.y + dy;
      if (!isWalkable(map, nextX, nextY)) {
        return { player: { ...state.player, facing } };
      }

      const trigger = findTrigger(map, nextX, nextY, true);
      if (trigger) {
        return {
          mode: { kind: 'vn', eventId: trigger.eventId, nodeId: 'start' },
          currentEventId: trigger.eventId,
          currentNodeId: 'start',
          player: { ...state.player, x: nextX, y: nextY, facing },
        };
      }

      return { player: { ...state.player, x: nextX, y: nextY, facing } };
    }),
  facePlayer: (facing) =>
    set((state) => ({
      player: { ...state.player, facing },
    })),
  spawnNpc: (npcId, spriteId, mapId, x, y, facing) =>
    set((state) => ({
      npcs: {
        ...state.npcs,
        [npcId]: { spriteId, mapId, x, y, facing },
      },
    })),
  enterEvent: (eventId) =>
    set({
      mode: { kind: 'vn', eventId, nodeId: 'start' },
      currentEventId: eventId,
      currentNodeId: 'start',
    }),
  goToEvent: (eventId, nodeId) => {
    if (nodeId === undefined || nodeId === 'start') {
      get().enterEvent(eventId);
      return;
    }

    set({
      mode: { kind: 'vn', eventId, nodeId },
      currentEventId: eventId,
      currentNodeId: nodeId,
    });
  },
  exitToMap: (mapId, x, y, facing) =>
    set((state) => ({
      mode: { kind: 'tilemap', mapId },
      currentEventId: null,
      currentNodeId: null,
      player: { ...state.player, mapId, x, y, facing },
    })),
  endGame: (reason) =>
    set({
      mode: { kind: 'end', reason },
      currentEventId: null,
      currentNodeId: null,
    }),
  advanceNode: (choice) => {
    const state = get();
    if (state.mode.kind !== 'vn') {
      return;
    }

    const graph = EVENTS[state.mode.eventId];
    if (!graph) {
      throw new Error(`Event graph not found: ${state.mode.eventId}`);
    }

    const node = getNode(graph, state.mode.nodeId);
    let nextNodeId: string | null = null;
    let flags = state.flags;

    if (node.type === 'choice') {
      if (choice === undefined) {
        return;
      }

      const option = node.options[choice];
      if (!option) {
        return;
      }

      nextNodeId = option.next;
      flags = option.setFlags ? { ...flags, ...option.setFlags } : flags;
    } else {
      nextNodeId = advance(graph, node);
    }

    if (!nextNodeId) {
      if (node.type === 'returnToMap') {
        set((current) => ({
          mode: { kind: 'tilemap', mapId: node.mapId },
          currentEventId: null,
          currentNodeId: null,
          player: { ...current.player, mapId: node.mapId, x: node.x, y: node.y },
          flags,
        }));
      } else if (node.type === 'end') {
        set({
          mode: { kind: 'end', reason: node.reason },
          currentEventId: null,
          currentNodeId: null,
          flags,
        });
      }
      return;
    }

    const nextNode = getNode(graph, nextNodeId);
    if (nextNode.type === 'returnToMap') {
      set((current) => ({
        mode: { kind: 'tilemap', mapId: nextNode.mapId },
        currentEventId: null,
        currentNodeId: null,
        player: { ...current.player, mapId: nextNode.mapId, x: nextNode.x, y: nextNode.y },
        flags,
      }));
      return;
    }

    if (nextNode.type === 'end') {
      set({
        mode: { kind: 'end', reason: nextNode.reason },
        currentEventId: null,
        currentNodeId: null,
        flags,
      });
      return;
    }

    set({
      mode: { kind: 'vn', eventId: state.mode.eventId, nodeId: nextNodeId },
      currentEventId: state.mode.eventId,
      currentNodeId: nextNodeId,
      flags,
    });
  },
  chooseOption: (index) => get().advanceNode(index),
}));
