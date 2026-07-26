import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const MAX_PROMPT_LENGTH = 4000;

function sseFrame(data: string): Uint8Array {
  return encoder.encode(`data: ${data}\n\n`);
}

function eventFrame(event: string, fields: Record<string, unknown> = {}): Uint8Array {
  return sseFrame(JSON.stringify({ event, ...fields }));
}

function errorStream(message: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(eventFrame("error", { message }));
      controller.enqueue(sseFrame("[DONE]"));
      controller.close();
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * agentcore_stream_proxy.mjs pipes the AgentCore response through verbatim.
 * Each SSE `data:` line is a JSON string that itself contains a JSON event
 * object (double-encoded), shaped like:
 *   { event: "stage"|"stage_result"|"report_delta"|"final"|"error", stage,
 *     text, data, reference_ids, references, citation_units,
 *     data_limitations, error_code, error_message }
 * `stage` is a lightweight "this stage is now running" ping; `stage_result`
 * is that stage's completed decision summary (e.g. which dimensions the
 * agent planned to research, how many sources passed verification).
 * `report_delta.data.section` tags which report section a chunk belongs to
 * — sections are generated in parallel upstream, but deltas are still sent
 * in final section order, so the frontend can just concatenate per-section
 * text in arrival order.
 * This re-frames that into the single-encoded `{event,text|message}`
 * protocol lib/api/sse.ts expects, so the upstream's exact shape is
 * isolated to this one function.
 */
function normalizeAgentStream(upstream: Response): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      function handleFrame(frame: string) {
        const dataLine = frame.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) return;
        const raw = dataLine.slice(5).trim();
        if (!raw) return;

        let event: Record<string, unknown> | null = null;
        try {
          const once = JSON.parse(raw);
          event = typeof once === "string" ? JSON.parse(once) : once;
        } catch {
          // Not the expected double-encoded JSON — surface as raw delta text.
          controller.enqueue(eventFrame("delta", { text: raw }));
          return;
        }
        if (!event || typeof event !== "object") return;

        switch (event.event) {
          case "stage":
            if (typeof event.text === "string") {
              controller.enqueue(eventFrame("stage", { text: event.text }));
            }
            break;
          case "stage_result":
            if (typeof event.text === "string") {
              controller.enqueue(eventFrame("stage_result", { text: event.text }));
            }
            break;
          case "report_delta": {
            const section = isRecord(event.data) && typeof event.data.section === "string" ? event.data.section : undefined;
            controller.enqueue(
              eventFrame("delta", { text: typeof event.text === "string" ? event.text : "", section })
            );
            break;
          }
          case "final": {
            const dataLimitation = Array.isArray(event.data_limitations)
              ? event.data_limitations.find((s): s is string => typeof s === "string")
              : undefined;
            controller.enqueue(
              eventFrame("final", { text: typeof event.text === "string" ? event.text : "", dataLimitation })
            );
            break;
          }
          case "error":
            console.error("AgentCore stream error event", {
              code: event.error_code,
              message: event.error_message,
            });
            controller.enqueue(eventFrame("error", { message: "Agent 服務暫時發生問題，請稍後再試。" }));
            break;
          default:
            break;
        }
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) handleFrame(frame);
        }
      } catch (error) {
        console.error("Agent stream normalization failed", error);
        controller.enqueue(eventFrame("error", { message: "串流中斷，請稍後再試。" }));
      } finally {
        controller.enqueue(sseFrame("[DONE]"));
        controller.close();
      }
    },
  });
}

function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Disabled here and re-asserted for any reverse proxy (e.g. Nginx) in front on EC2.
    "X-Accel-Buffering": "no",
  };
}

function chunkText(text: string, size = 4): string[] {
  const codePoints = Array.from(text);
  const chunks: string[] = [];
  for (let i = 0; i < codePoints.length; i += size) {
    chunks.push(codePoints.slice(i, i + size).join(""));
  }
  return chunks;
}

function buildMockReply(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("btc") || message.includes("比特幣")) {
    return "市場情緒分析 — BTC\n\n當前恐懼貪婪指數為 68（貪婪），較一週前上升 12 點。\n\n關鍵依據：\n· 鏈上大戶地址 72h 內新增 3 個 >10K BTC 地址\n· 交易所淨流出 12,450 BTC，持續囤積趨勢\n· BTC ETF 昨日淨流入 4.2 億美元\n\n來源：CoinGlass、Glassnode、SoSoValue";
  }
  if (text.includes("eth")) {
    return "鏈上活躍度分析 — ETH\n\n以太坊 24h 活躍地址數為 624,800，較 7 日均值上升 8.3%。\n\n· Gas 均價 18 Gwei，處於近 30 日低位\n· DeFi TVL 穩定在 48.2B 美元\n· L2 總交易量突破 12M tx/day\n\n來源：Etherscan、DefiLlama、L2Beat";
  }
  if (text.includes("sol")) {
    return "SOL — 未來一週趨勢分析\n\n當前價格 172.40 美元（24h +4.2%）\n\n· 站穩 4H MA20（165 美元）\n· RSI 62，尚未進入超買區\n· Solana DEX 日交易量 2.8B 美元\n\n判斷：短期偏多，目標區間 178–185 美元。";
  }
  return `已收到你的問題：「${message}」。\n\n這是本地示範回覆（尚未設定 AGENT_FUNCTION_URL 環境變數）。設定 AGENT_FUNCTION_URL 後，這個 route 會改為即時代理 Bedrock AgentCore 的真實串流回應。`;
}

export async function POST(request: NextRequest) {
  const agentFunctionUrl = process.env.AGENT_FUNCTION_URL;
  const payload = (await request.json()) as { message?: string; history?: unknown };
  const message = payload.message ?? "";

  if (agentFunctionUrl) {
    // The Lambda (agentcore_stream_proxy.mjs) only accepts a single-key
    // body `{"prompt": "..."}` and starts a fresh AgentCore session per
    // call, so conversation history is intentionally not forwarded.
    const prompt = message.trim();

    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      const reason = !prompt ? "訊息不可為空。" : `訊息長度不可超過 ${MAX_PROMPT_LENGTH} 字元。`;
      return new Response(errorStream(reason), { headers: sseHeaders() });
    }

    // The Lambda's ?verify= token is provided by the user via the settings
    // UI (stored client-side, sent as this header) rather than hardcoded
    // server config. AGENT_FUNCTION_URL_VERIFY_TOKEN is only a deployment
    // fallback for when the user hasn't set one yet.
    const verifyToken =
      request.headers.get("x-agent-verify-token") || process.env.AGENT_FUNCTION_URL_VERIFY_TOKEN;

    if (!verifyToken) {
      return new Response(
        errorStream("尚未設定 Agent 存取碼，請點擊右上角的設定圖示輸入 verify token。"),
        { headers: sseHeaders() }
      );
    }

    const url = new URL(agentFunctionUrl);
    url.searchParams.set("verify", verifyToken);

    let upstream: Response;
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: request.signal,
      });
    } catch (error) {
      console.error("Agent function URL request failed", error);
      return new Response(errorStream("無法連線至 Agent 服務，請稍後再試。"), {
        headers: sseHeaders(),
      });
    }

    if (upstream.status === 401) {
      return new Response(errorStream("Agent 存取碼不正確，請點擊右上角的設定圖示重新輸入。"), {
        headers: sseHeaders(),
      });
    }

    if (!upstream.ok || !upstream.body) {
      console.error("Agent function URL returned an error", upstream.status);
      return new Response(errorStream("Agent 服務暫時無法回應，請稍後再試。"), {
        headers: sseHeaders(),
      });
    }

    return new Response(normalizeAgentStream(upstream), { headers: sseHeaders() });
  }

  const chunks = chunkText(buildMockReply(message));
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(eventFrame("stage", { text: "正在分析你的問題..." }));
      await new Promise((resolve) => setTimeout(resolve, 200));
      for (const chunk of chunks) {
        if (request.signal.aborted) break;
        controller.enqueue(eventFrame("delta", { text: chunk }));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      controller.enqueue(sseFrame("[DONE]"));
      controller.close();
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
