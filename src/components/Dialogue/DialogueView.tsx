import type { ReactNode } from 'react';
import { Background } from './Background';
import { CharacterPortrait } from './CharacterPortrait';
import { DialogueBox } from './DialogueBox';
import { ChoiceList } from './ChoiceList';

export interface DialogueViewProps {
  location?: string | undefined;
  backgroundUrl?: string | undefined;
  speakerName?: string | undefined;
  speakerEmotion?: string | undefined;
  speakerPosition?: 'left' | 'center' | 'right' | undefined;
  speakerImageUrl?: string | undefined;
  text: string;
  choices?: Array<{ id: string; label: string; disabled?: boolean; hint?: string }> | undefined;
  onAdvance?: (() => void) | undefined;
  onChoose?: ((id: string) => void) | undefined;
  hud?: ReactNode | undefined;
  children?: ReactNode | undefined;
}

function NarrationDecoration({ location: _location }: { location?: string | undefined }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center z-[5] pointer-events-none pb-[38dvh]">
      <svg
        className="w-[min(90%,420px)] opacity-[0.08]"
        viewBox="0 0 400 200"
        aria-hidden
      >
        <g stroke="#c9954a" strokeWidth="1" fill="none">
          <circle cx="200" cy="100" r="70" />
          <line x1="130" y1="100" x2="270" y2="100" />
          <line x1="200" y1="30" x2="200" y2="170" />
        </g>
      </svg>
    </div>
  );
}

export function DialogueView(props: DialogueViewProps) {
  const showChoices = (props.choices?.length ?? 0) > 0;
  const position = props.speakerPosition ?? 'center';

  const portraitWrapperClass =
    position === 'left'
      ? 'left-0 sm:left-6 translate-x-0'
      : position === 'right'
        ? 'right-0 sm:right-6 translate-x-0'
        : 'left-1/2 -translate-x-1/2';

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden">
      <Background location={props.location} imageUrl={props.backgroundUrl} />

      {props.hud ? (
        <div className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-6 pt-[env(safe-area-inset-top)]">
          <div className="max-w-3xl mx-auto pt-2">{props.hud}</div>
        </div>
      ) : null}

      {props.speakerName ? (
        <div
          className={`absolute bottom-[18%] sm:bottom-[20%] md:bottom-[22%] z-10 ${portraitWrapperClass} transition-all duration-300 pointer-events-none`}
        >
          <CharacterPortrait
            name={props.speakerName}
            position={position}
            emotion={props.speakerEmotion}
            imageUrl={props.speakerImageUrl}
          />
        </div>
      ) : null}

      {!props.speakerName && !props.speakerImageUrl ? (
        <NarrationDecoration location={props.location} />
      ) : null}

      {props.children}

      <div className="absolute top-[82%] sm:top-[80%] md:top-[78%] left-0 right-0 z-20 px-3 sm:px-6 max-h-[22dvh] overflow-y-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-2 sm:gap-3">
          <DialogueBox
            speaker={props.speakerName}
            text={props.text}
            onAdvance={showChoices ? undefined : props.onAdvance}
            showContinueHint={!showChoices}
          />
          {showChoices ? (
            <ChoiceList choices={props.choices ?? []} onSelect={props.onChoose ?? (() => {})} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
