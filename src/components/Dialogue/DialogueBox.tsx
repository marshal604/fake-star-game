import { useTypewriter } from './useTypewriter';

interface DialogueBoxProps {
  speaker?: string | undefined;
  text: string;
  onAdvance?: (() => void) | undefined;
  showContinueHint?: boolean | undefined;
}

export function DialogueBox({ speaker, text, onAdvance, showContinueHint = true }: DialogueBoxProps) {
  const { text: shown, done, finish } = useTypewriter(text);
  const isNarration = !speaker;

  const handleClick = () => {
    if (!done) {
      finish();
      return;
    }
    onAdvance?.();
  };

  const containerClass = isNarration
    ? 'bg-black/60 backdrop-blur-md border border-ink-100/5 rounded-xl italic'
    : 'bg-black/75 backdrop-blur-md border border-court-wood/40 rounded-2xl';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!onAdvance && done}
      className={`w-full text-left ${containerClass} p-4 sm:p-5 active:scale-[0.998] transition`}
    >
      {speaker ? (
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-3 bg-court-wood" />
          <div className="text-court-wood text-sm font-semibold tracking-wide">{speaker}</div>
        </div>
      ) : null}
      <p
        className={`text-ink-50 leading-relaxed whitespace-pre-wrap ${
          isNarration ? 'text-[15px] sm:text-base text-ink-100/85' : 'text-base sm:text-lg'
        }`}
      >
        {shown}
        {!done ? <span className="inline-block w-1 h-[1em] bg-court-wood/60 ml-0.5 animate-pulse align-middle" /> : null}
      </p>
      {showContinueHint && done && onAdvance ? (
        <div className="mt-2 text-xs text-ink-100/50 text-right">點擊繼續 ▸</div>
      ) : null}
    </button>
  );
}
