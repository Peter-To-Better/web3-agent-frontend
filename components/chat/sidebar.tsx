"use client";

import { sidebarPrompts } from "@/lib/chat-data";

interface SidebarProps {
  onPromptSelect: (prompt: string) => void;
}

export function Sidebar({ onPromptSelect }: SidebarProps) {
  return (
    <aside className="hidden w-[260px] flex-col border-r border-ink-border bg-ink-surface md:flex">
      <div className="border-b border-ink-border px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-fg-muted">
          快速提問
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-fg-muted">
          點擊問題填入輸入框，確認後再送出。
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sidebarPrompts.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onPromptSelect(item.prompt)}
            className="group mb-1 flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-ink-elevated"
            title={`填入問題：${item.prompt}`}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-border text-[10px] font-semibold text-ink-fg-muted transition-colors group-hover:border-ink-accent group-hover:text-ink-accent">
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-ink-fg-secondary transition-colors group-hover:text-ink-fg">
                {item.title}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-fg-muted">
                {item.prompt}
              </span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
