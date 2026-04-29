import type { Facing, TilemapData } from './types';

export type Trigger = TilemapData['triggers'][number];

export function isWalkable(map: TilemapData, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    return false;
  }

  return !map.collision[y]?.[x];
}

export function findTrigger(
  map: TilemapData,
  x: number,
  y: number,
  autoFireOnly = false,
): Trigger | null {
  return (
    map.triggers.find((trigger) => {
      if (trigger.x !== x || trigger.y !== y) {
        return false;
      }

      return autoFireOnly ? trigger.autoFire === true : true;
    }) ?? null
  );
}

export function neighbour(x: number, y: number, facing: Facing): { x: number; y: number } {
  if (facing === 'up') return { x, y: y - 1 };
  if (facing === 'right') return { x: x + 1, y };
  if (facing === 'down') return { x, y: y + 1 };
  return { x: x - 1, y };
}

export function neighbours(map: TilemapData, x: number, y: number): Array<{ x: number; y: number }> {
  return (['up', 'right', 'down', 'left'] as const)
    .map((facing) => neighbour(x, y, facing))
    .filter((position) => isWalkable(map, position.x, position.y));
}
