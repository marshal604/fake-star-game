import { useEffect, useState } from 'react';
import type { Facing } from '~/core/types';

const FACING_ROW: Record<Facing, number> = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};

interface PlayerSpriteProps {
  x: number;
  y: number;
  facing: Facing;
  tileSize: number;
}

export function PlayerSprite({ x, y, facing, tileSize }: PlayerSpriteProps) {
  const [frame, setFrame] = useState(0);
  const frameHeight = tileSize * 1.5;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % 4);
    }, 180);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: x * tileSize,
        top: y * tileSize - tileSize / 2,
        width: tileSize,
        height: frameHeight,
        backgroundImage: 'url(/sprites/protagonist.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${tileSize * 4}px ${frameHeight * 4}px`,
        backgroundPosition: `-${frame * tileSize}px -${FACING_ROW[facing] * frameHeight}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
}
