import { useEffect, useState } from 'react';
import type { Facing, SpeakerId } from '~/core/types';

const FACING_ROW: Record<Facing, number> = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};

interface NpcSpriteProps {
  x: number;
  y: number;
  facing: Facing;
  spriteId: SpeakerId;
  tileSize: number;
}

export function NpcSprite({ x, y, facing, spriteId, tileSize }: NpcSpriteProps) {
  const [frame, setFrame] = useState(0);
  const frameHeight = tileSize * 1.5;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % 2);
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{
        left: x * tileSize,
        top: y * tileSize - tileSize / 2,
        width: tileSize,
        height: frameHeight,
        backgroundImage: `url(/sprites/${spriteId}.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${tileSize * 4}px ${frameHeight * 4}px`,
        backgroundPosition: `-${frame * tileSize}px -${FACING_ROW[facing] * frameHeight}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
}
