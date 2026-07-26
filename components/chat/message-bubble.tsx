import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { ChatMessage } from "@/lib/types";
import { TypingIndicator } from "./typing-indicator";
import { MarketIndicatorCard } from "./market-indicator-card";

function MessageLabel() {
  return (
    <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-ink-fg-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-accent" />
      HOYA BIT AI
    </div>
  );
}

/** Running trace of each research stage's completed decision summary (stage_result events). */
function StageLog({ lines }: { lines: string[] }) {
  return (
    <div className="flex flex-col gap-1 px-1 text-[11px] text-ink-fg-muted">
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-fg-muted" />
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}

function markdownComponents(isUser: boolean): Components {
  const inlineCode = isUser
    ? "rounded bg-black/15 px-1 py-0.5 font-mono text-[13px]"
    : "rounded bg-ink-elevated px-1 py-0.5 font-mono text-[13px] text-ink-accent";
  const codeBlock = isUser ? "bg-black/15" : "border border-ink-border bg-ink-elevated";
  const link = isUser
    ? "underline underline-offset-2 hover:opacity-80"
    : "text-ink-accent underline underline-offset-2 hover:opacity-80";

  return {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }) => (
      <strong className={isUser ? "font-bold" : "font-bold text-ink-gain"}>{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className={link}>
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    h1: ({ children }) => <h1 className="mb-2 mt-1 text-base font-bold first:mt-0">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-2 mt-1 text-[15px] font-bold first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-1 mt-1 text-sm font-bold first:mt-0">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="mb-2 border-l-2 border-ink-border pl-3 text-current/80 last:mb-0">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-3 border-ink-border" />,
    pre: ({ children }) => (
      <pre className={`mb-2 overflow-x-auto rounded-lg ${codeBlock} p-3 text-xs last:mb-0`}>
        {children}
      </pre>
    ),
    code: ({ className, children }) => {
      const isBlock = /language-/.test(className ?? "");
      if (isBlock) {
        return <code className={`font-mono ${className ?? ""}`}>{children}</code>;
      }
      return <code className={inlineCode}>{children}</code>;
    },
    table: ({ children }) => (
      <div className="mb-2 overflow-x-auto last:mb-0">
        <table className="w-full border-collapse text-xs">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-ink-border px-2 py-1 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => <td className="border-b border-ink-border/60 px-2 py-1 align-top">{children}</td>,
  };
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
      {!isUser && message.stageLog && message.stageLog.length > 0 && <StageLog lines={message.stageLog} />}
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={markdownComponents(isUser)}
          >
            {message.content}
          </ReactMarkdown>
          {!isUser && message.streaming && (
            <span className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-0.5 animate-pulse-dot bg-ink-gain" />
          )}
        </div>
      )}
      {!isUser && !message.streaming && message.dataLimitation && (
        <div className="flex items-start gap-1.5 px-1 text-[11px] text-ink-fg-muted">
          <span>⚠</span>
          <span>{message.dataLimitation}</span>
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
