import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function sseFrame(data: string): Uint8Array {
  return encoder.encode(`data: ${data}\n\n`);
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
  return `已收到你的問題：「${message}」。\n\n這是本地示範回覆（尚未設定 BACKEND_URL 環境變數）。設定 BACKEND_URL 後，這個 route 會改為即時代理你的真實後端 SSE 回應。`;
}

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  const payload = (await request.json()) as { message?: string; history?: unknown };
  const message = payload.message ?? "";

  if (backendUrl) {
    const path = process.env.BACKEND_CHAT_STREAM_PATH ?? "/chat/stream";
    const upstream = await fetch(`${backendUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: request.signal,
    });

    if (!upstream.ok || !upstream.body) {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            sseFrame(JSON.stringify({ delta: "後端服務暫時無法連線，請稍後再試。" }))
          );
          controller.enqueue(sseFrame("[DONE]"));
          controller.close();
        },
      });
      return new Response(stream, { headers: sseHeaders() });
    }

    return new Response(upstream.body, { headers: sseHeaders() });
  }

  const chunks = chunkText(buildMockReply(message));
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        if (request.signal.aborted) break;
        controller.enqueue(sseFrame(JSON.stringify({ delta: chunk })));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      controller.enqueue(sseFrame("[DONE]"));
      controller.close();
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
