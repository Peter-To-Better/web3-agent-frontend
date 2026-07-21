import { TopBar } from "@/components/layout";
import { TickerTape } from "@/components/home";
import { SentimentGauge, RecommendationTable } from "@/components/dashboard";
import {
  fearGreedReading,
  marketRsiReading,
  longRecommendations,
  shortRecommendations,
} from "@/lib/dashboard-data";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <TickerTape />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-10 md:px-12">
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-ink-fg">數據看板</h1>
        <p className="mb-8 text-sm text-ink-fg-secondary">市場情緒與做多/做空推薦快照，示範資料。</p>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SentimentGauge reading={fearGreedReading} />
          <SentimentGauge reading={marketRsiReading} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RecommendationTable title="🟢 做多推薦" tone="gain" rows={longRecommendations} />
          <RecommendationTable title="🔴 做空推薦" tone="loss" rows={shortRecommendations} />
        </div>
      </main>
    </div>
  );
}
