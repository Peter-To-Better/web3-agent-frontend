interface TypingIndicatorProps {
  text?: string;
}

export function TypingIndicator({ text = "分析中..." }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex gap-1">
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-typing-bounce rounded-full bg-ink-accent"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      <span className="text-[13px] font-medium text-ink-fg-secondary">{text}</span>
    </div>
  );
}
