export type SpeakerId = 'protagonist' | 'suman' | 'chenyifu';
export type Facing = 'up' | 'down' | 'left' | 'right';

export type GameMode =
  | { kind: 'tilemap'; mapId: string }
  | { kind: 'vn'; eventId: string; nodeId: string }
  | { kind: 'end'; reason: string };

export type EventNode =
  | { type: 'narration'; text: string; next: string }
  | { type: 'dialogue'; speaker: SpeakerId; emotion?: string; text: string; next: string }
  | { type: 'choice'; prompt?: string; options: Array<ChoiceOption> }
  | { type: 'spawnNpc'; npcId: string; mapId: string; x: number; y: number; next: string }
  | { type: 'walkNpcTo'; npcId: string; x: number; y: number; next: string }
  | { type: 'returnToMap'; mapId: string; x: number; y: number }
  | { type: 'enterMap'; mapId: string; x: number; y: number; facing: Facing }
  | { type: 'end'; reason: string };

export interface ChoiceOption {
  label: string;
  next: string;
  setFlags?: Record<string, boolean | number | string>;
}

export type EventGraph = Record<string, EventNode>;

export interface TilemapData {
  id: string;
  name: string;
  tileSize: number;
  width: number;
  height: number;
  baseUrl?: string;
  props?: Array<{
    id: string;
    url: string;
    x: number;
    y: number;
    z?: number;
    collision?: { x: number; y: number; w: number; h: number };
  }>;
  tilesetUrl: string;
  tilesetCols: number;
  tilesetRows: number;
  layers: { ground: number[][]; objects: number[][] };
  collision: boolean[][];
  triggers: Array<{ id: string; x: number; y: number; eventId: string; autoFire?: boolean }>;
  spawns: { player: { x: number; y: number; facing: Facing } };
}
