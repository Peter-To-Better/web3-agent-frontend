"use client";

import { useCallback, useRef, useState } from "react";
import { streamChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const history = messages.map(({ role, content }) => ({ role, content }));
      const aiMessageId = createId();

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "user", content: trimmed },
        { id: aiMessageId, role: "ai", content: "", streaming: true },
      ]);
      setInput("");
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      streamChatMessage(
        trimmed,
        history,
        {
          onDelta: (delta) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMessageId ? { ...m, content: m.content + delta } : m))
            );
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMessageId ? { ...m, streaming: false } : m))
            );
            setIsStreaming(false);
            abortRef.current = null;
          },
          onError: (error) => {
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
    [messages, isStreaming]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setInput("");
    setIsStreaming(false);
  }, []);

  return { messages, input, setInput, isStreaming, send, stop, reset };
}
