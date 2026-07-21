import { NextResponse } from "next/server";
import type { ChatHistoryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const MOCK_HISTORY: ChatHistoryItem[] = [
  { id: "1", title: "BTC 市場情緒分析" },
  { id: "2", title: "ETH 鏈上活躍度" },
  { id: "3", title: "SOL 生態系近況" },
];

export async function GET() {
  const backendUrl = process.env.BACKEND_URL;

  if (backendUrl) {
    const path = process.env.BACKEND_CHAT_HISTORY_PATH ?? "/chat/history";
    const upstream = await fetch(`${backendUrl}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (upstream.ok) {
      const data = (await upstream.json()) as ChatHistoryItem[];
      return NextResponse.json(data);
    }
  }

  return NextResponse.json(MOCK_HISTORY);
}
