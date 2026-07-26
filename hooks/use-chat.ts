"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { streamChatMessage } from "@/lib/api";
import { detectSymbolFromText } from "@/lib/coin-symbols";
import type { ChatMessage, MarketRankingRow } from "@/lib/types";

function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// The backend sends the answer in a small number of large chunks rather than
// token-by-token, so we reveal the received text on our own clock instead of
// dumping it straight to screen — reads as live typing regardless of how the
// data actually arrived. Duration stays roughly constant regardless of
// length: bigger jumps reveal more chars per tick rather than taking longer.
const TYPEWRITER_TICK_MS = 16;
const TYPEWRITER_TARGET_TICKS = 60;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const targetContentRef = useRef("");
  const revealedLengthRef = useRef(0);
  const networkDoneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // report_delta chunks are tagged with which report section they belong to.
  // Sections are generated in parallel upstream but still arrive in final
  // section order, so keeping per-section text and joining in arrival order
  // is enough to avoid interleaved/garbled output even if that ordering
  // guarantee ever slips.
  const sectionOrderRef = useRef<string[]>([]);
  const sectionTextRef = useRef<Map<string, string>>(new Map());
  const UNSECTIONED = "__unsectioned__";

  const stopTypewriter = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopTypewriter;
  }, [stopTypewriter]);

  const ensureTypewriter = useCallback(
    (aiMessageId: string, onComplete: () => void) => {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        // Completion is decided purely from refs, never from state read back
        // out of a setState call — React doesn't guarantee an updater passed
        // to setMessages runs before the very next line, so a side effect
        // written inside the updater and read right after it can observe a
        // stale value and leave the stream looking permanently "stuck".
        const target = targetContentRef.current;
        if (revealedLengthRef.current < target.length) {
          const remaining = target.length - revealedLengthRef.current;
          const step = Math.max(1, Math.ceil(remaining / TYPEWRITER_TARGET_TICKS));
          revealedLengthRef.current = Math.min(target.length, revealedLengthRef.current + step);
          const nextContent = target.slice(0, revealedLengthRef.current);
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMessageId ? { ...m, content: nextContent } : m))
          );
        }

        if (revealedLengthRef.current >= target.length && networkDoneRef.current) {
          stopTypewriter();
          onComplete();
        }
      }, TYPEWRITER_TICK_MS);
    },
    [stopTypewriter]
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const history = messages.map(({ role, content }) => ({ role, content }));
      const aiMessageId = createId();
      const relatedSymbol = detectSymbolFromText(trimmed) ?? undefined;

      targetContentRef.current = "";
      revealedLengthRef.current = 0;
      networkDoneRef.current = false;
      sectionOrderRef.current = [];
      sectionTextRef.current = new Map();
      stopTypewriter();

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "user", content: trimmed },
        { id: aiMessageId, role: "ai", content: "", streaming: true, relatedSymbol },
      ]);
      setInput("");
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      function appendSectionDelta(deltaText: string, section?: string) {
        const key = section ?? UNSECTIONED;
        if (!sectionTextRef.current.has(key)) {
          sectionTextRef.current.set(key, "");
          sectionOrderRef.current.push(key);
        }
        sectionTextRef.current.set(key, sectionTextRef.current.get(key)! + deltaText);
        targetContentRef.current = sectionOrderRef.current.map((k) => sectionTextRef.current.get(k)).join("");
      }

      function finishStreaming() {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, streaming: false } : m))
        );
        setIsStreaming(false);
        abortRef.current = null;

        if (!relatedSymbol) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, marketIndicatorLoading: true } : m))
        );
        fetch(`/api/market/symbol?symbol=${encodeURIComponent(relatedSymbol)}`)
          .then((res) => (res.ok ? (res.json() as Promise<MarketRankingRow>) : null))
          .then((indicator) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId
                  ? { ...m, marketIndicator: indicator, marketIndicatorLoading: false }
                  : m
              )
            );
          })
          .catch(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId ? { ...m, marketIndicator: null, marketIndicatorLoading: false } : m
              )
            );
          });
      }

      streamChatMessage(
        trimmed,
        history,
        {
          onStage: (stage) => {
            setMessages((prev) => prev.map((m) => (m.id === aiMessageId ? { ...m, stage } : m)));
          },
          onStageResult: (text) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMessageId ? { ...m, stageLog: [...(m.stageLog ?? []), text] } : m))
            );
          },
          onDelta: (delta, section) => {
            appendSectionDelta(delta, section);
            ensureTypewriter(aiMessageId, finishStreaming);
          },
          onFinal: (fullText, dataLimitation) => {
            // Authoritative — replaces whatever deltas accumulated so far.
            // Applied immediately (not via the typewriter's incremental
            // reveal): if fullText is shorter than what's already been
            // revealed from deltas, revealedLengthRef would already sit past
            // target.length, so the interval's "still revealing" branch
            // would never re-fire and the stale, longer delta text would
            // stay on screen forever instead of being corrected.
            targetContentRef.current = fullText;
            revealedLengthRef.current = fullText.length;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId ? { ...m, content: fullText, ...(dataLimitation ? { dataLimitation } : {}) } : m
              )
            );
            ensureTypewriter(aiMessageId, finishStreaming);
          },
          onDone: () => {
            networkDoneRef.current = true;
            // If nothing was ever revealed (e.g. an empty answer), the
            // typewriter interval never started, so finish immediately.
            if (!timerRef.current) finishStreaming();
          },
          onError: (error) => {
            stopTypewriter();
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId
                  ? { ...m, content: m.content || `發生錯誤：${error.message}`, streaming: false }
                  : m
              )
            );
            setIsStreaming(false);
            abortRef.current = null;
          },
        },
        controller.signal
      );
    },
    [messages, isStreaming, ensureTypewriter, stopTypewriter]
  );

  const stop = useCallback(() => {
    stopTypewriter();
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
  }, [stopTypewriter]);

  const reset = useCallback(() => {
    stopTypewriter();
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setInput("");
    setIsStreaming(false);
  }, [stopTypewriter]);

  return { messages, input, setInput, isStreaming, send, stop, reset };
}
