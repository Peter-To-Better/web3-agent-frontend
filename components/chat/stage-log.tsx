"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { markdownComponents } from "./markdown-components";

/**
 * Stage lines usually open with a short "什麼階段：" prefix. Pulling it out
 * into a chip is what makes a wall of trace text scannable, so only treat a
 * prefix as a label when it really is a label — short, and free of the
 * punctuation that shows up mid-sentence.
 */
const MAX_LABEL_LENGTH = 12;

function splitLabel(line: string): { label?: string; body: string } {
  const separatorIndex = line.indexOf("：");
  if (separatorIndex < 0 || separatorIndex > MAX_LABEL_LENGTH) return { body: line };

  const label = line.slice(0, separatorIndex).trim();
  if (!label || /[，。？！\n#*]/.test(label)) return { body: line };

  return { label, body: line.slice(separatorIndex + 1).trim() };
}

/**
 * Upstream flattens a report section's markdown onto one line, so `- ` list
 * items and `###` headings arrive mid-string where remark can't see them as
 * block-level markers and the whole thing renders as one paragraph. Re-break
 * on those markers so the list structure the agent actually emitted shows up.
 */
function restoreBlockBreaks(text: string): string {
  return text.replace(/\s+-\s+(?=\*\*)/g, "\n- ").replace(/\s+(?=#{1,3}\s)/g, "\n\n");
}

function StageEntry({ line, index, isLast }: { line: string; index: number; isLast: boolean }) {
  const { label, body } = splitLabel(line);

  return (
    <li className="relative flex gap-3 pb-3 last:pb-0">
      {!isLast && (
        <span aria-hidden className="absolute left-[11px] top-6 bottom-0 w-px bg-ink-border" />
      )}
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-border bg-ink-elevated font-mono text-[11px] font-semibold text-ink-accent">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        {label && (
          <div className="mb-1 text-[13px] font-bold tracking-wide text-ink-accent">{label}</div>
        )}
        <div className="text-[13px] leading-relaxed text-ink-fg-secondary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={markdownComponents({ compact: true })}
          >
            {restoreBlockBreaks(body)}
          </ReactMarkdown>
        </div>
      </div>
    </li>
  );
}

/** Running trace of each research stage's completed decision summary (stage_result events). */
export function StageLog({ lines }: { lines: string[] }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-ink-border bg-ink-surface/60">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-ink-elevated/50"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`shrink-0 text-ink-fg-muted transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-[13px] font-bold tracking-wide text-ink-fg">推理軌跡</span>
        <span className="rounded-full border border-ink-border bg-ink-elevated px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-accent">
          {lines.length}
        </span>
        <span className="ml-auto text-[11px] text-ink-fg-muted">
          {expanded ? "收起" : "展開"}
        </span>
      </button>

      {expanded && (
        <ol className="border-t border-ink-border px-4 py-3">
          {lines.map((line, i) => (
            <StageEntry key={i} line={line} index={i} isLast={i === lines.length - 1} />
          ))}
        </ol>
      )}
    </div>
  );
}
