import type { Components } from "react-markdown";

interface MarkdownOptions {
  isUser?: boolean;
  /** Tighter spacing and smaller headings, for the stage-log trace. */
  compact?: boolean;
}

export function markdownComponents({ isUser = false, compact = false }: MarkdownOptions = {}): Components {
  const inlineCode = isUser
    ? "rounded bg-black/15 px-1 py-0.5 font-mono text-[13px]"
    : "rounded bg-ink-elevated px-1 py-0.5 font-mono text-[13px] text-ink-accent";
  const codeBlock = isUser ? "bg-black/15" : "border border-ink-border bg-ink-elevated";
  const link = isUser
    ? "underline underline-offset-2 hover:opacity-80"
    : "text-ink-accent underline underline-offset-2 hover:opacity-80";
  const gap = compact ? "mb-1.5" : "mb-2";
  const heading = compact
    ? { h1: "text-[14px]", h2: "text-[14px]", h3: "text-[13px]" }
    : { h1: "text-lg", h2: "text-base", h3: "text-[15px]" };
  const headingColor = compact ? "text-ink-fg" : "";

  return {
    p: ({ children }) => <p className={`${gap} last:mb-0`}>{children}</p>,
    strong: ({ children }) => (
      <strong className={isUser ? "font-bold" : "font-bold text-ink-gain"}>{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className={link}>
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className={`${gap} list-disc space-y-1 pl-5 last:mb-0`}>{children}</ul>,
    ol: ({ children }) => <ol className={`${gap} list-decimal space-y-1 pl-5 last:mb-0`}>{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    h1: ({ children }) => (
      <h1 className={`${gap} mt-1 ${heading.h1} font-bold ${headingColor} first:mt-0`}>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${gap} mt-1 ${heading.h2} font-bold ${headingColor} first:mt-0`}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className={`mb-1 mt-1 ${heading.h3} font-bold ${headingColor} first:mt-0`}>{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`${gap} border-l-2 border-ink-border pl-3 text-current/80 last:mb-0`}>
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-3 border-ink-border" />,
    pre: ({ children }) => (
      <pre className={`${gap} overflow-x-auto rounded-lg ${codeBlock} p-3 text-xs last:mb-0`}>
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
      <div className={`${gap} overflow-x-auto last:mb-0`}>
        <table className="w-full border-collapse text-xs">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-ink-border px-2 py-1 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => <td className="border-b border-ink-border/60 px-2 py-1 align-top">{children}</td>,
  };
}
