import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import officeMap from '~/content/maps/office.json';
import { findTrigger, neighbour } from '~/core/tilemap';
import type { TilemapData } from '~/core/types';
import { useGameStore } from '~/store/gameStore';
import { NpcSprite } from './NpcSprite';
import { PlayerSprite } from './PlayerSprite';

const MAPS: Record<string, TilemapData> = {
  office: officeMap as TilemapData,
};

interface TilemapSceneProps {
  mapId: string;
}

function tileStyle(map: TilemapData, tileId: number): CSSProperties {
  if (tileId < 0) {
    return {};
  }

  const col = tileId % map.tilesetCols;
  const row = Math.floor(tileId / map.tilesetCols);
  return {
    backgroundImage: `url(${map.tilesetUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${map.tilesetCols * map.tileSize}px ${map.tilesetRows * map.tileSize}px`,
    backgroundPosition: `-${col * map.tileSize}px -${row * map.tileSize}px`,
    imageRendering: 'pixelated',
  };
}

export function TilemapScene({ mapId }: TilemapSceneProps) {
  const map = MAPS[mapId] ?? MAPS.office;
  const mode = useGameStore((state) => state.mode);
  const player = useGameStore((state) => state.player);
  const npcs = useGameStore((state) => state.npcs);
  const movePlayer = useGameStore((state) => state.movePlayer);
  const enterEvent = useGameStore((state) => state.enterEvent);

  useEffect(() => {
    if (mode.kind !== 'tilemap') {
      return undefined;
    }

    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const movement: Record<string, { dx: number; dy: number }> = {
        arrowup: { dx: 0, dy: -1 },
        w: { dx: 0, dy: -1 },
        arrowright: { dx: 1, dy: 0 },
        d: { dx: 1, dy: 0 },
        arrowdown: { dx: 0, dy: 1 },
        s: { dx: 0, dy: 1 },
        arrowleft: { dx: -1, dy: 0 },
        a: { dx: -1, dy: 0 },
      };

      const delta = movement[key];
      if (delta) {
        event.preventDefault();
        movePlayer(delta.dx, delta.dy);
        return;
      }

      if (key === ' ' || key === 'e') {
        event.preventDefault();
        const state = useGameStore.getState();
        const activeMap = MAPS[state.player.mapId] ?? map;
        const target = neighbour(state.player.x, state.player.y, state.player.facing);
        const trigger =
          findTrigger(activeMap, state.player.x, state.player.y, false) ??
          findTrigger(activeMap, target.x, target.y, false);
        if (trigger) {
          enterEvent(trigger.eventId);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enterEvent, map, mode.kind, movePlayer]);

  const visibleNpcs = Object.entries(npcs).filter(([, npc]) => npc.mapId === map.id);

  return (
    <main className="min-h-[100dvh] bg-[#11110f] text-[#f7f7f6] flex items-center justify-center p-4">
      <div
        className="relative overflow-hidden border border-[#4d453a] bg-[#191712] shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
        style={{
          width: map.width * map.tileSize,
          height: map.height * map.tileSize,
        }}
        aria-label={map.name}
      >
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${map.width}, ${map.tileSize}px)`,
            gridTemplateRows: `repeat(${map.height}, ${map.tileSize}px)`,
          }}
        >
          {map.layers.ground.flatMap((row, y) =>
            row.map((tileId, x) => (
              <div
                key={`ground-${x}-${y}`}
                style={{ width: map.tileSize, height: map.tileSize, ...tileStyle(map, tileId) }}
              />
            )),
          )}
        </div>

        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${map.width}, ${map.tileSize}px)`,
            gridTemplateRows: `repeat(${map.height}, ${map.tileSize}px)`,
          }}
        >
          {map.layers.objects.flatMap((row, y) =>
            row.map((tileId, x) => (
              <div
                key={`object-${x}-${y}`}
                style={{ width: map.tileSize, height: map.tileSize, ...tileStyle(map, tileId) }}
              />
            )),
          )}
        </div>

        {visibleNpcs.map(([npcId, npc]) => (
          <NpcSprite
            key={npcId}
            x={npc.x}
            y={npc.y}
            facing={npc.facing}
            spriteId={npc.spriteId}
            tileSize={map.tileSize}
          />
        ))}
        <PlayerSprite x={player.x} y={player.y} facing={player.facing} tileSize={map.tileSize} />
      </div>
    </main>
  );
}
