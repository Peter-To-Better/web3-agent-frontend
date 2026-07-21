interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ prompts, onSelect }: SuggestedPromptsProps) {
  return (
    <div className="border-t border-ink-border p-4">
      <div className="mb-2 text-[11px] text-ink-fg-muted">建議提問</div>
      <div className="flex flex-col gap-1">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="cursor-pointer rounded-lg border border-transparent px-2.5 py-2 text-left text-xs text-ink-fg-secondary transition-colors hover:border-ink-border hover:bg-ink-elevated hover:text-ink-fg"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
