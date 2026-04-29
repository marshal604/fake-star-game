import { TilemapScene } from './components/Tilemap/TilemapScene';
import { useGameStore } from './store/gameStore';

function VnScene({ eventId, nodeId }: { eventId: string; nodeId: string }) {
  return (
    <main className="min-h-[100dvh] bg-[#11110f] text-[#f7f7f6] flex items-center justify-center p-6">
      <div>VN {eventId}/{nodeId}</div>
    </main>
  );
}

function EndScene({ reason }: { reason: string }) {
  return (
    <main className="min-h-[100dvh] bg-[#11110f] text-[#f7f7f6] flex items-center justify-center p-6">
      <div>END: {reason}</div>
    </main>
  );
}

export default function App() {
  const mode = useGameStore((state) => state.mode);

  if (mode.kind === 'tilemap') return <TilemapScene mapId={mode.mapId} />;
  if (mode.kind === 'vn') return <VnScene eventId={mode.eventId} nodeId={mode.nodeId} />;
  return <EndScene reason={mode.reason} />;
}
