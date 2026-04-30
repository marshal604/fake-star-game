interface CharacterPortraitProps {
  name: string;
  position: 'left' | 'center' | 'right';
  emotion?: string | undefined;
  imageUrl?: string | undefined;
}

export function CharacterPortrait({ name, position, imageUrl }: CharacterPortraitProps) {
  if (imageUrl) {
    return (
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="h-[69dvh] sm:h-[78dvh] md:h-[80dvh] w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-end">
      <svg
        viewBox="0 0 120 220"
        className="h-[44dvh] sm:h-[50dvh] md:h-[56dvh] w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="silhouette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0908" />
            <stop offset="100%" stopColor="#1a1614" />
          </linearGradient>
        </defs>
        <g fill="url(#silhouette)" stroke="rgba(201,149,74,0.4)" strokeWidth="0.8">
          {/* head */}
          <circle cx="60" cy="32" r="18" />
          {/* neck */}
          <path d="M52 50 L68 50 L70 58 L50 58 Z" />
          {/* shoulders + torso */}
          <path d="M30 60 Q45 58 60 60 Q75 58 90 60 L90 130 Q60 135 30 130 Z" />
          {/* arms (relaxed) */}
          <path d="M30 62 Q22 90 26 130 L32 130 Q30 95 36 68 Z" />
          <path d="M90 62 Q98 90 94 130 L88 130 Q90 95 84 68 Z" />
          {/* waist */}
          <path d="M32 128 Q60 135 88 128 L84 160 Q60 165 36 160 Z" />
          {/* racket hinted in right hand */}
          <ellipse
            cx="92"
            cy="140"
            rx="4"
            ry="12"
            fill="none"
            stroke="rgba(201,149,74,0.5)"
            strokeWidth="1"
          />
          <line
            x1="92"
            y1="152"
            x2="100"
            y2="190"
            stroke="rgba(201,149,74,0.4)"
            strokeWidth="1.2"
          />
        </g>
      </svg>
      <div className="mt-1 px-2 py-0.5 rounded text-[11px] text-ink-100/70 bg-black/40 font-display tracking-wide">
        {name}
      </div>
      <span className="sr-only">{position}</span>
    </div>
  );
}
