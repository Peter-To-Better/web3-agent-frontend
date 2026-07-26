import type { ChatMessage } from "@/lib/types";
import { TypingIndicator } from "./typing-indicator";
import { MarketIndicatorCard } from "./market-indicator-card";

function renderLine(line: string, key: number) {
  const parts = line.split(/(\*\*.+?\*\*)/g).filter(Boolean);
  return (
    <span key={key} className="block">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="text-ink-gain">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function MessageLabel() {
  return (
    <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-ink-fg-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-accent" />
      HOYA BIT AI
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isPendingFirstToken = !isUser && message.streaming && !message.content;

  return (
    <div
      className={`flex max-w-[720px] flex-col gap-2 ${
        isUser ? "items-end self-end" : "items-start self-start"
      }`}
    >
      {!isUser && <MessageLabel />}
      {isPendingFirstToken ? (
        <TypingIndicator text={message.stage} />
      ) : (
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-sm bg-ink-accent px-[18px] py-3.5 text-sm font-medium leading-relaxed text-ink-bg"
              : "rounded-2xl rounded-bl-sm border border-ink-border bg-ink-surface px-[18px] py-3.5 text-sm leading-relaxed text-ink-fg"
          }
        >
          {message.content.split("\n").map((line, i) => renderLine(line, i))}
          {!isUser && message.streaming && (
            <span className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-0.5 animate-pulse-dot bg-ink-gain" />
          )}
        </div>
      )}
      {!isUser && !message.streaming && message.marketIndicatorLoading && (
        <span className="px-1 text-[11px] text-ink-fg-muted">
          正在讀取 {message.relatedSymbol} 即時指標…
        </span>
      )}
      {!isUser && !message.streaming && message.marketIndicator && (
        <MarketIndicatorCard indicator={message.marketIndicator} />
      )}
    </div>
  );
}
