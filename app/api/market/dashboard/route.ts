import { NextResponse } from "next/server";
import { getMarketDashboardData } from "@/lib/market-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMarketDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Market dashboard fetch failed", error);
    return NextResponse.json({ error: "無法取得即時市場資料，請稍後再試。" }, { status: 502 });
  }
}
