import { TopBar } from "@/components/layout";
import { TickerTape } from "@/components/home";
import { MarketPanel } from "@/components/dashboard";
import { getMarketDashboardData } from "@/lib/market-data";
import type { MarketDashboardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data: MarketDashboardData | null = await getMarketDashboardData().catch((error) => {
    console.error("Dashboard market data fetch failed", error);
    return null;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
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
