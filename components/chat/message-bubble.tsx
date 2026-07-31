import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { ChatMessage } from "@/lib/types";
import { TypingIndicator } from "./typing-indicator";
import { MarketIndicatorCard } from "./market-indicator-card";
import { StageLog } from "./stage-log";
import { MessageActions } from "./message-actions";
import { markdownComponents } from "./markdown-components";

function MessageLabel() {
  return (
    <div className="flex items-center gap-2 px-1 text-xs font-bold tracking-wide text-ink-fg-secondary">
      <span className="h-2 w-2 rounded-full bg-ink-accent" />
      HOYA BIT AI
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  /** Full conversation, so the share action can export the whole transcript. */
  messages: ChatMessage[];
}

export function MessageBubble({ message, messages }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isPendingFirstToken = !isUser && message.streaming && !message.content;
  const isComplete = !isUser && !message.streaming && Boolean(message.content);

  return (
    <div
      className={`flex w-full max-w-[820px] flex-col gap-2.5 ${
        isUser ? "items-end self-end" : "items-start self-start"
      }`}
    >
      {!isUser && <MessageLabel />}
      {!isUser && message.stageLog && message.stageLog.length > 0 && <StageLog lines={message.stageLog} />}
      {isPendingFirstToken ? (
        <TypingIndicator text={message.stage} />
      ) : (
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-sm bg-ink-accent px-5 py-3.5 text-[15px] font-medium leading-relaxed text-ink-bg"
              : "rounded-2xl rounded-bl-sm border border-ink-border bg-ink-surface px-5 py-4 text-[15px] leading-[1.75] text-ink-fg"
          }
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={markdownComponents({ isUser })}
          >
            {message.content}
          </ReactMarkdown>
          {!isUser && message.streaming && (
            <span className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-0.5 animate-pulse-dot bg-ink-gain" />
          )}
        </div>
      )}
      {!isUser && !message.streaming && message.dataLimitation && (
        <div className="flex w-full items-start gap-2 rounded-lg border border-ink-accent/30 bg-ink-accent/5 px-3 py-2 text-xs leading-relaxed text-ink-fg-secondary">
          <span className="text-ink-accent">⚠</span>
          <span>
            <span className="font-bold text-ink-accent">資料限制</span>
            <span className="mx-1.5 text-ink-fg-muted">·</span>
            {message.dataLimitation}
          </span>
        </div>
      )}
      {!isUser && !message.streaming && message.marketIndicatorLoading && (
        <span className="px-1 text-xs text-ink-fg-secondary">
          正在讀取 {message.relatedSymbol} 即時指標…
        </span>
      )}
      {!isUser && !message.streaming && message.marketIndicator && (
        <MarketIndicatorCard indicator={message.marketIndicator} />
      )}
      {isComplete && <MessageActions message={message} messages={messages} />}
    </div>
  );
}
