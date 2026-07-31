"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { decodeConversation, type SharedConversation } from "@/lib/share-link";
import { markdownComponents } from "./markdown-components";
import { StageLog } from "./stage-log";

type LoadState = { status: "loading" } | { status: "empty" } | { status: "ready"; data: SharedConversation };

function formatTimestamp(epochMs: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = new Date(epochMs);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SharedConversationView() {
  // The payload lives in the fragment, which is never sent to the server —
  // so decoding has to happen client-side after mount.
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const encoded = window.location.hash.slice(1);
    let active = true;

    (encoded ? decodeConversation(encoded) : Promise.resolve(null)).then((data) => {
      if (!active) return;
      setState(data && data.turns.length ? { status: "ready", data } : { status: "empty" });
    });

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <p className="text-sm text-ink-fg-secondary">正在載入分享的對話…</p>;
  }

  if (state.status === "empty") {
    return (
      <div className="rounded-xl border border-ink-border bg-ink-surface p-6">
        <h1 className="mb-2 text-lg font-bold text-ink-fg">找不到分享內容</h1>
        <p className="text-sm leading-relaxed text-ink-fg-secondary">
          這個連結沒有帶有效的對話資料，可能在複製時被截斷了。請向分享者索取完整連結。
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-ink-fg">分享的分析對話</h1>
      <p className="mb-8 text-sm text-ink-fg-secondary">
        由 HOYA BIT AI 產生 · 匯出於 {formatTimestamp(state.data.t)}
      </p>

      <div className="flex flex-col gap-5">
        {state.data.turns.map((turn, i) =>
          turn.r === "user" ? (
            <div
              key={i}
              className="self-end rounded-2xl rounded-br-sm bg-ink-accent px-5 py-3.5 text-[15px] font-medium leading-relaxed text-ink-bg"
            >
              {turn.c}
            </div>
          ) : (
            <div key={i} className="flex w-full flex-col gap-2.5">
              <div className="flex items-center gap-2 px-1 text-xs font-bold tracking-wide text-ink-fg-secondary">
                <span className="h-2 w-2 rounded-full bg-ink-accent" />
                HOYA BIT AI
              </div>
              {turn.s?.length ? <StageLog lines={turn.s} /> : null}
              <div className="rounded-2xl rounded-bl-sm border border-ink-border bg-ink-surface px-5 py-4 text-[15px] leading-[1.75] text-ink-fg">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents()}>
                  {turn.c}
                </ReactMarkdown>
              </div>
              {turn.l && (
                <div className="flex w-full items-start gap-2 rounded-lg border border-ink-accent/30 bg-ink-accent/5 px-3 py-2 text-xs leading-relaxed text-ink-fg-secondary">
                  <span className="text-ink-accent">⚠</span>
                  <span>
                    <span className="font-bold text-ink-accent">資料限制</span>
                    <span className="mx-1.5 text-ink-fg-muted">·</span>
                    {turn.l}
                  </span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}
