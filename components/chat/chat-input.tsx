"use client";

import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

export function ChatInput({ value, onChange, onSend, disabled, isStreaming, onStop }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep the textarea height in sync for both typing and programmatic values
  // (for example when a sidebar prompt fills the controlled input).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (value) el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  function handleInput(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Skip while an IME (e.g. 注音/拼音) composition is in progress — Enter there
    // confirms the candidate word, it isn't a submit request.
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  }

  return (
    <div className="border-t border-ink-border px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-[720px] items-end gap-2.5 rounded-xl border border-ink-border bg-ink-surface py-1.5 pl-4 pr-1.5 focus-within:border-ink-accent">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="輸入你的問題，例如「BTC 目前的市場情緒如何？」"
          className="max-h-[120px] flex-1 resize-none bg-transparent py-2 text-sm text-ink-fg outline-none placeholder:text-ink-fg-muted"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="停止產生"
            className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-ink-elevated text-ink-fg transition-opacity hover:opacity-85"
          >
            <span className="h-2.5 w-2.5 rounded-[2px] bg-ink-fg" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            aria-label="送出"
            className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-ink-accent text-ink-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
      <div className="mt-2 text-center text-[11px] text-ink-fg-muted">
        AI Agent 會從多個資料來源蒐集資訊，分析結果僅供參考，不構成投資建議。
      </div>
    </div>
  );
}
