export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex gap-1">
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-typing-bounce rounded-full bg-ink-fg-muted"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-ink-fg-muted">分析中...</span>
    </div>
  );
}
