export interface SSECallbacks {
  onChunk: (data: string, event?: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

interface StreamSSEOptions extends SSECallbacks {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

/**
 * Generic Server-Sent Events consumer built on fetch + ReadableStream
 * (native EventSource can't send a POST body, which most chat/completion
 * endpoints require). Parses standard `event:` / `data:` frames separated
 * by blank lines, and treats a literal `data: [DONE]` frame as stream end.
 */
export async function streamSSE(url: string, options: StreamSSEOptions): Promise<void> {
  const { method = "POST", body, signal, headers, onChunk, onDone, onError } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`SSE 連線失敗（HTTP ${response.status}）`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        let eventName: string | undefined;
        const dataLines: string[] = [];

        for (const line of frame.split("\n")) {
          if (line.startsWith("event:")) eventName = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }

        const data = dataLines.join("\n");
        if (!data) continue;
        if (data === "[DONE]") {
          onDone?.();
          return;
        }
        onChunk(data, eventName);
      }
    }

    onDone?.();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    onError?.(error instanceof Error ? error : new Error("串流發生未知錯誤"));
  }
}

export interface ChatHistoryTurn {
  role: "user" | "ai";
  content: string;
}

export interface ChatStreamCallbacks {
  onDelta: (deltaText: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Streams one chat turn from same-origin `/api/chat/stream`, which proxies
 * to the real backend (see app/api/chat/stream/route.ts). Each SSE frame is
 * expected to be JSON `{ "delta": "..." }`; falls back to raw text if not.
 */
export function streamChatMessage(
  message: string,
  history: ChatHistoryTurn[],
  callbacks: ChatStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  return streamSSE("/api/chat/stream", {
    method: "POST",
    body: { message, history },
    signal,
    onChunk: (data) => {
      try {
        const parsed = JSON.parse(data) as { delta?: string };
        callbacks.onDelta(parsed.delta ?? "");
      } catch {
        callbacks.onDelta(data);
      }
    },
    onDone: callbacks.onDone,
    onError: callbacks.onError,
  });
}
