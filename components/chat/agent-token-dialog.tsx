"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getAgentVerifyToken,
  setAgentVerifyToken,
  subscribeToAgentVerifyToken,
} from "@/lib/agent-token";

function useHasAgentToken() {
  return useSyncExternalStore(
    subscribeToAgentVerifyToken,
    () => !!getAgentVerifyToken(),
    () => false
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function AgentTokenDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const hasToken = useHasAgentToken();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleOpen() {
    setValue(getAgentVerifyToken());
    setOpen(true);
  }

  function handleSave() {
    setAgentVerifyToken(value);
    setOpen(false);
  }

  function handleClear() {
    setAgentVerifyToken("");
    setValue("");
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="設定 Agent 存取碼"
        className="flex items-center gap-1.5 rounded-lg border border-ink-border px-2.5 py-1.5 text-xs text-ink-fg-secondary transition-colors hover:border-ink-fg-secondary hover:text-ink-fg"
      >
        <GearIcon />
        <span
          className={`h-[6px] w-[6px] rounded-full ${hasToken ? "bg-ink-gain" : "bg-ink-loss"}`}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-ink-border bg-ink-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-ink-fg">Agent 存取碼</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-fg-muted">
              對接 Bedrock AgentCore 的 Lambda 需要 <code className="text-ink-fg-secondary">verify</code>{" "}
              token 才會通過請求。此值儲存在你的瀏覽器（localStorage），僅在你傳送訊息時隨請求送到本站伺服器，再轉送給
              Agent。
            </p>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="輸入 verify token"
              autoFocus
              className="mt-4 w-full rounded-lg border border-ink-border bg-ink-elevated px-3 py-2 text-sm text-ink-fg outline-none focus:border-ink-accent"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium text-ink-fg-muted transition-colors hover:text-ink-loss"
              >
                清除
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-lg border border-ink-border px-3.5 py-2 text-xs font-medium text-ink-fg-secondary transition-colors hover:border-ink-fg-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="cursor-pointer rounded-lg bg-ink-accent px-3.5 py-2 text-xs font-semibold text-ink-bg transition-opacity hover:opacity-90"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
