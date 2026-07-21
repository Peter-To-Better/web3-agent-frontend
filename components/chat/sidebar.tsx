"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { ChatHistoryItem } from "@/lib/types";
import { suggestedPrompts } from "@/lib/chat-data";
import { ChatHistoryList } from "./chat-history-list";
import { SuggestedPrompts } from "./suggested-prompts";

interface SidebarProps {
  onNewChat: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export function Sidebar({ onNewChat, onSelectPrompt }: SidebarProps) {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<ChatHistoryItem[]>("/chat/history")
      .then((items) => {
        if (cancelled) return;
        setHistory(items);
        setActiveId(items[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="hidden w-[260px] flex-col border-r border-ink-border bg-ink-surface md:flex">
      <div className="border-b border-ink-border p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-fg-muted">
          對話紀錄
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveId(null);
            onNewChat();
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-ink-border bg-ink-elevated px-3.5 py-2.5 text-[13px] font-medium text-ink-fg transition-colors hover:border-ink-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="7" x2="7" y2="7" />
            <line x1="9.5" y1="4.5" x2="9.5" y2="9.5" />
          </svg>
          新對話
        </button>
      </div>
      <ChatHistoryList items={history} activeId={activeId} onSelect={setActiveId} />
      <SuggestedPrompts prompts={suggestedPrompts} onSelect={onSelectPrompt} />
    </aside>
  );
}
