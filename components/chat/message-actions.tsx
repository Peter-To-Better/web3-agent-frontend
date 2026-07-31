"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { buildReportMarkdown } from "@/lib/chat-export";
import { buildShareUrl, encodeReport } from "@/lib/share-link";

type ActionKey = "copy" | "share" | "pdf";

const FEEDBACK_MS = 2000;

async function copyToClipboard(text: string) {
  // navigator.clipboard needs a secure context — absent when the demo is
  // served over plain HTTP from an EC2 IP, so fall back to a hidden textarea.
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function ActionButton({
  label,
  done,
  doneLabel,
  onClick,
  children,
}: {
  label: string;
  done: boolean;
  doneLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        done
          ? "border-ink-gain/50 bg-ink-gain/10 text-ink-gain"
          : "border-ink-border text-ink-fg-secondary hover:border-ink-fg-secondary hover:text-ink-fg"
      }`}
    >
      {done ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        children
      )}
      {done ? doneLabel : label}
    </button>
  );
}

interface MessageActionsProps {
  message: ChatMessage;
  /** Full conversation, for the share action's transcript. */
  messages: ChatMessage[];
}

export function MessageActions({ message, messages }: MessageActionsProps) {
  const [doneAction, setDoneAction] = useState<ActionKey | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const flash = useCallback((key: ActionKey) => {
    setError(null);
    setDoneAction(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDoneAction(null), FEEDBACK_MS);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(buildReportMarkdown(message));
      flash("copy");
    } catch {
      setError("複製失敗，請手動選取內容。");
    }
  }, [message, flash]);

  const handlePdf = useCallback(async () => {
    // Rendering the PDF via the browser's own print engine avoids bundling a
    // PDF library and a CJK font — the report page opens its print dialog
    // itself, where the user picks "Save as PDF".
    const question = messages[messages.findIndex((m) => m.id === message.id) - 1];
    let encoded: string;
    try {
      encoded = await encodeReport(message, question?.role === "user" ? question.content : undefined);
    } catch {
      setError("產生報告失敗。");
      return;
    }

    const tab = window.open(`/report#${encoded}`, "_blank", "noopener");
    if (!tab) {
      setError("瀏覽器阻擋了新視窗，請允許彈出視窗後再試。");
      return;
    }
    flash("pdf");
  }, [message, messages, flash]);

  const handleShare = useCallback(async () => {
    let url: string;
    try {
      // The whole conversation is packed into the link's fragment, so the
      // recipient needs no account and nothing is stored server-side.
      url = await buildShareUrl(messages, window.location.origin);
    } catch {
      setError("產生分享連結失敗。");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: "HOYA BIT AI 分析", url });
        return;
      } catch (shareError) {
        // User dismissed the native sheet — not a failure worth reporting.
        if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      }
    }

    try {
      await copyToClipboard(url);
      setShareUrl(url);
      flash("share");
    } catch {
      setShareUrl(url);
      setError("自動複製失敗，請手動複製下方連結。");
    }
  }, [messages, flash]);

  return (
    <div className="flex w-full flex-col gap-2 px-1">
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton label="複製報告" doneLabel="已複製" done={doneAction === "copy"} onClick={handleCopy}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 012-2h8" />
          </svg>
        </ActionButton>

        <ActionButton label="下載 PDF" doneLabel="已開啟列印" done={doneAction === "pdf"} onClick={handlePdf}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 15h6" />
          </svg>
        </ActionButton>

        <ActionButton label="分享對話" doneLabel="已複製連結" done={doneAction === "share"} onClick={handleShare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </ActionButton>

        {error && <span className="text-xs text-ink-loss">{error}</span>}
      </div>

      {shareUrl && (
        <div className="flex flex-col gap-1 rounded-lg border border-ink-border bg-ink-elevated px-3 py-2">
          <span className="text-[11px] font-semibold text-ink-fg-secondary">
            分享連結（任何人開啟即可看到這段對話）
          </span>
          <input
            readOnly
            value={shareUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full bg-transparent font-mono text-[11px] text-ink-accent outline-none"
          />
        </div>
      )}
    </div>
  );
}
