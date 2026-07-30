"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SentimentGauge } from "./sentiment-gauge";
import { MarketRankingTable } from "./market-ranking-table";
import { FeatureTour } from "@/components/tour";
import { dashboardTourSteps } from "@/lib/tour-steps";
import { useLivePrices } from "@/hooks/use-live-prices";
import type { GaugeReading } from "@/lib/dashboard-data";
import type { FearGreedReading, MarketDashboardData, MarketRankingRow } from "@/lib/types";

// RSI / long-short ratio / POC / which coins are even in the top-5 all
// require a server-side recompute across several symbols — they genuinely
// can't update faster than this without hammering Binance for no benefit
// (the underlying hourly candles and 5-minute long/short snapshots don't
// change meaningfully faster anyway). Price/24h change instead comes from
// a live WebSocket ticker (see useLivePrices) — those tick in real time.
const POLL_INTERVAL_MS = 8_000;

function toGaugeReading(data: MarketDashboardData): GaugeReading {
  return {
    title: "熱門標的平均 RSI",
    value: data.averageRsi ?? 50,
    previousValue: data.previousAverageRsi ?? data.averageRsi ?? 50,
    zones: ["超賣", "偏弱", "中性", "偏強", "超買"],
  };
}

function toFearGreedGaugeReading(reading: FearGreedReading | null): GaugeReading {
  return {
    title: "恐慌貪婪指數",
    value: reading?.value ?? 50,
    previousValue: reading?.previousValue ?? reading?.value ?? 50,
    zones: ["極度恐懼", "恐懼", "中性", "貪婪", "極度貪婪"],
  };
}

function applyLivePrice<T extends { symbol: string; price: number; changePct: number }>(
  row: T,
  live: Record<string, { price: number; changePct: number }>
): T {
  const tick = live[row.symbol];
  return tick ? { ...row, price: tick.price, changePct: tick.changePct } : row;
}

interface MarketPanelProps {
  initialData: MarketDashboardData | null;
  fearGreed: FearGreedReading | null;
}

export function MarketPanel({ initialData, fearGreed }: MarketPanelProps) {
  const [data, setData] = useState(initialData);
  const [staleError, setStaleError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pollNowRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;

    async function poll() {
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await fetch("/api/market/dashboard", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const fresh = (await res.json()) as MarketDashboardData;
        if (!cancelled) {
          setData(fresh);
          setStaleError(false);
        }
      } catch {
        if (!cancelled) setStaleError(true);
      } finally {
        inFlight = false;
        setRefreshing(false);
        // Reschedule from completion rather than a fixed setInterval, so a
        // slow request can't overlap with the next tick.
        if (!cancelled) {
          clearTimeout(timer);
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    }

    pollNowRef.current = () => {
      setRefreshing(true);
      clearTimeout(timer);
      poll();
    };

    if (initialData) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    } else {
      poll();
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Mount-only: `initialData` is only consulted to decide whether an
    // immediate poll is needed (SSR failed), not tracked reactively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(() => pollNowRef.current(), []);

  const liveSymbols = data
    ? [...data.gainers.map((r) => r.symbol), ...data.losers.map((r) => r.symbol), ...data.volumes.map((r) => r.symbol)]
    : [];
  const livePrices = useLivePrices(liveSymbols);

  if (!data) {
    return (
      <div className="rounded-xl border border-ink-border bg-ink-surface px-4 py-3 text-xs text-ink-fg-muted">
        目前無法取得即時市場資料，將持續重試…
      </div>
    );
  }

  const updatedTime = new Date(data.updatedAt).toLocaleTimeString("zh-TW", { hour12: false });
  const liveGainers: MarketRankingRow[] = data.gainers.map((r) => applyLivePrice(r, livePrices));
  const liveLosers: MarketRankingRow[] = data.losers.map((r) => applyLivePrice(r, livePrices));
  const liveVolumes: MarketRankingRow[] = data.volumes.map((r) => applyLivePrice(r, livePrices));

  return (
    <div className="flex flex-col gap-4">
      {/* 只在資料成功渲染後掛載導覽，確保 spotlight 目標都存在。 */}
      <FeatureTour tourId="dashboard" steps={dashboardTourSteps} />
      {/* items-start：排行卡按內容自然高度，不再被拉伸到與較高的儀表欄等高。 */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_320px]">
        <MarketRankingTable
          gainers={liveGainers}
          losers={liveLosers}
          volumes={liveVolumes}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <div className="flex flex-col gap-2">
          <div data-tour="dash-rsi-gauge">
            <SentimentGauge reading={toGaugeReading(data)} animateOnScroll={false} />
          </div>
          <div
            data-tour="dash-freshness"
            className="flex items-center justify-between px-1 font-mono text-[11px] text-ink-fg-muted"
          >
            <span>價格即時（WebSocket）／RSI 每 {POLL_INTERVAL_MS / 1000}s 更新</span>
            <span>{staleError ? "更新失敗，顯示上次資料" : `RSI 更新於 ${updatedTime}`}</span>
          </div>
          <div data-tour="dash-fng-gauge">
            <SentimentGauge reading={toFearGreedGaugeReading(fearGreed)} animateOnScroll={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
