import { getAgentVerifyToken } from "@/lib/agent-token";

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
  /**
   * Abort and report a timeout error if no bytes arrive for this long (ms).
   * Backend proxies occasionally relay an upstream that stops sending
   * without ever closing the connection — without this, the UI would wait
   * forever since neither onDone nor onError would ever fire.
   */
  idleTimeoutMs?: number;
}

const DEFAULT_IDLE_TIMEOUT_MS = 60_000;

/**
 * Generic Server-Sent Events consumer built on fetch + ReadableStream
 * (native EventSource can't send a POST body, which most chat/completion
 * endpoints require). Parses standard `event:` / `data:` frames separated
 * by blank lines, and treats a literal `data: [DONE]` frame as stream end.
 */
export async function streamSSE(url: string, options: StreamSSEOptions): Promise<void> {
  const {
    method = "POST",
    body,
    signal,
    headers,
    onChunk,
    onDone,
    onError,
    idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
  } = options;

  const idleController = new AbortController();
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(
      () => idleController.abort(new DOMException("串流逾時無回應", "TimeoutError")),
      idleTimeoutMs
    );
  };
  const fetchSignal = signal ? AbortSignal.any([signal, idleController.signal]) : idleController.signal;

  try {
    resetIdleTimer();
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: fetchSignal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`SSE 連線失敗（HTTP ${response.status}）`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      resetIdleTimer();
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
          clearTimeout(idleTimer);
          onDone?.();
          return;
        }
        onChunk(data, eventName);
      }
    }

    clearTimeout(idleTimer);
    onDone?.();
  } catch (error) {
    clearTimeout(idleTimer);
    if (error instanceof DOMException && error.name === "TimeoutError") {
      onError?.(new Error("串流逾時無回應，請重新嘗試。"));
      return;
    }
    if (error instanceof DOMException && error.name === "AbortError") return;
    onError?.(error instanceof Error ? error : new Error("串流發生未知錯誤"));
  }
}

export interface ChatHistoryTurn {
  role: "user" | "ai";
  content: string;
}

const AGENT_VERIFY_TOKEN_HEADER = "X-Agent-Verify-Token";

export interface ChatStreamCallbacks {
  /** Live progress narration (e.g. "searching sources...") — not part of the answer text. */
  onStage?: (text: string) => void;
  onDelta: (deltaText: string) => void;
  /** Authoritative full answer text; when received it replaces (not appends to) accumulated deltas. */
  onFinal?: (fullText: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Streams one chat turn from same-origin `/api/chat/stream`, which proxies
 * to the real backend (see app/api/chat/stream/route.ts). The route
 * normalizes whatever the upstream agent sends into a single-encoded JSON
 * frame per SSE event: `{ "event": "stage" | "delta" | "final" | "error", "text"?: "...", "message"?: "..." }`.
 */
export function streamChatMessage(
  message: string,
  history: ChatHistoryTurn[],
  callbacks: ChatStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const verifyToken = getAgentVerifyToken();

  return streamSSE("/api/chat/stream", {
    method: "POST",
    body: { message, history },
    signal,
    headers: verifyToken ? { [AGENT_VERIFY_TOKEN_HEADER]: verifyToken } : undefined,
    onChunk: (data) => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(data) as Record<string, unknown>;
      } catch {
        callbacks.onDelta(data);
        return;
      }

      switch (parsed.event) {
        case "stage":
          if (typeof parsed.text === "string") callbacks.onStage?.(parsed.text);
          break;
        case "delta":
          callbacks.onDelta(typeof parsed.text === "string" ? parsed.text : "");
          break;
        case "final":
          if (typeof parsed.text === "string") callbacks.onFinal?.(parsed.text);
          break;
        case "error":
          callbacks.onError?.(
            new Error(typeof parsed.message === "string" ? parsed.message : "串流發生未知錯誤")
          );
          break;
        default:
          break;
      }
    },
    onDone: callbacks.onDone,
    onError: callbacks.onError,
  });
}
