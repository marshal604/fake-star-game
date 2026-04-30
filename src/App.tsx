import { EndScene } from './components/EndScene';
import { ModeFader } from './components/ModeFader';
import { TilemapScene } from './components/Tilemap/TilemapScene';
import { VnScene } from './components/VnScene';
import type { GameMode } from './core/types';
import { useGameStore } from './store/gameStore';

function modeKeyOf(mode: GameMode): string {
  if (mode.kind === 'tilemap') return `tilemap:${mode.mapId}`;
  if (mode.kind === 'vn') return `vn:${mode.eventId}`;
  return 'end';
}

export default function App() {
  const mode = useGameStore((state) => state.mode);

  return (
    <ModeFader modeKey={modeKeyOf(mode)}>
      {mode.kind === 'tilemap' ? <TilemapScene mapId={mode.mapId} /> : null}
      {mode.kind === 'vn' ? <VnScene eventId={mode.eventId} nodeId={mode.nodeId} /> : null}
      {mode.kind === 'end' ? <EndScene reason={mode.reason} /> : null}
    </ModeFader>
  );
}
