import { NextResponse } from "next/server";
import { getSymbolIndicators } from "@/lib/market-data";

export const dynamic = "force-dynamic";

const SYMBOL_PATTERN = /^[A-Za-z0-9]{2,15}$/;

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get("symbol") ?? "";

  if (!SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  try {
    const data = await getSymbolIndicators(symbol);
    if (!data) {
      return NextResponse.json({ error: "找不到這個幣種的市場資料。" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Symbol indicator fetch failed", error);
    return NextResponse.json({ error: "無法取得即時市場資料，請稍後再試。" }, { status: 502 });
  }
}
