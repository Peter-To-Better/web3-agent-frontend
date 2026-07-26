import Link from "next/link";
import { TopBar } from "@/components/layout";
import { TickerTape } from "@/components/home";
import { MarketPanel } from "@/components/dashboard";
import { getMarketDashboardData } from "@/lib/market-data";
import type { MarketDashboardData } from "@/lib/types";

export const dynamic = "force-dynamic";

function ChatLink() {
  return (
    <Link
      href="/chat"
      className="flex items-center gap-1.5 rounded-lg border border-ink-border px-2.5 py-1.5 text-xs text-ink-fg-secondary transition-colors hover:border-ink-fg-secondary hover:text-ink-fg"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      返回對話
    </Link>
  );
}

export default async function DashboardPage() {
  const data: MarketDashboardData | null = await getMarketDashboardData().catch((error) => {
    console.error("Dashboard market data fetch failed", error);
    return null;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar actions={<ChatLink />} />
      <TickerTape />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-10 md:px-12">
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-ink-fg">數據看板</h1>
        <p className="mb-8 text-sm text-ink-fg-secondary">
          即時市場排行、多空比與平均 RSI，資料來源 Binance，每 20 秒自動更新。
        </p>

        <MarketPanel initialData={data} />
      </main>
    </div>
  );
}
