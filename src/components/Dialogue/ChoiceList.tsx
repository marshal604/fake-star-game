interface Choice {
  id: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}

interface ChoiceListProps {
  choices: Choice[];
  onSelect: (id: string) => void;
}

export function ChoiceList({ choices, onSelect }: ChoiceListProps) {
  return (
    <ul className="flex flex-col gap-2 w-full">
      {choices.map((choice) => (
        <li key={choice.id}>
          <button
            type="button"
            disabled={choice.disabled}
            onClick={() => onSelect(choice.id)}
            className="w-full text-left rounded-xl bg-ink-900/60 border border-court-wood/40 hover:bg-ink-900/80 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 transition"
          >
            <span className="text-ink-50">{choice.label}</span>
            {choice.hint ? (
              <span className="block text-xs text-ink-100/50 mt-1">{choice.hint}</span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
