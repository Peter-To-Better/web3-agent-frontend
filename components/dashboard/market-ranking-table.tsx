"use client";

import { useState } from "react";
import { CornerFrame } from "@/components/common";
import type { MarketRankingRow } from "@/lib/types";

function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")}`;
}

function formatVolume(volume: number | null): string {
  if (volume === null) return "—";
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
  return `$${volume.toFixed(0)}`;
}

function formatFundingRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${rate >= 0 ? "+" : ""}${(rate * 100).toFixed(4)}%`;
}

function Sparkline({ points, isUp }: { points: number[] | null; isUp: boolean }) {
  if (!points || points.length < 2) {
    return <span className="text-ink-fg-muted">—</span>;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 56;
  const height = 20;
  const step = width / (points.length - 1);
  const coords = points
    .map((p, i) => `${(i * step).toFixed(1)},${(height - ((p - min) / range) * height).toFixed(1)}`)
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={coords}
        fill="none"
        stroke={isUp ? "var(--color-ink-gain)" : "var(--color-ink-loss)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Mode = "gainers" | "losers" | "volume";

const MODE_LABELS: Record<Mode, string> = {
  gainers: "漲幅",
  losers: "跌幅",
  volume: "成交額",
};

interface MarketRankingTableProps {
  gainers: MarketRankingRow[];
  losers: MarketRankingRow[];
  volumes: MarketRankingRow[];
  onRefresh: () => void;
  refreshing: boolean;
}

export function MarketRankingTable({ gainers, losers, volumes, onRefresh, refreshing }: MarketRankingTableProps) {
  const [mode, setMode] = useState<Mode>("gainers");
  const rows = mode === "gainers" ? gainers : mode === "losers" ? losers : volumes;
  const icon = mode === "gainers" ? "🔥" : mode === "losers" ? "🧊" : "📊";

  return (
    <CornerFrame data-tour="dash-ranking" className="border border-ink-border bg-ink-surface">
      <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
        <span className="text-sm font-semibold text-ink-fg">
          {icon} 24h {MODE_LABELS[mode]}排行（前 5 名）
        </span>
        <div className="flex items-center gap-3">
          <div data-tour="dash-tabs" className="flex rounded-lg border border-ink-border p-0.5 text-[11px] font-medium">
            {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  mode === m
                    ? m === "losers"
                      ? "bg-ink-loss/15 text-ink-loss"
                      : "bg-ink-gain/15 text-ink-gain"
                    : "text-ink-fg-muted hover:text-ink-fg"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="font-mono text-[11px] text-ink-fg-muted transition-colors hover:text-ink-fg disabled:opacity-50"
          >
            {refreshing ? "更新中…" : "↻ 更新"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] font-mono text-[13px]">
          <thead>
            <tr className="text-left text-[11px] text-ink-fg-muted">
              <th className="w-8 px-4 py-2 font-normal">#</th>
              <th className="px-2 py-2 font-normal">幣種</th>
              <th className="px-2 py-2 font-normal">價格</th>
              <th className="px-2 py-2 text-right font-normal">24h 漲跌</th>
              <th className="px-2 py-2 font-normal">走勢</th>
              <th className="px-2 py-2 text-right font-normal">RSI(14)</th>
              <th className="px-2 py-2 text-right font-normal">多空比</th>
              <th className="px-2 py-2 text-right font-normal">資金費率</th>
              <th className="px-2 py-2 text-right font-normal">POC</th>
              <th className="px-4 py-2 text-right font-normal">24h 成交額</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isUp = row.changePct >= 0;
              const changeTone = isUp ? "text-ink-gain" : "text-ink-loss";
              const longShortTone =
                row.longShortRatio === null
                  ? "text-ink-fg-muted"
                  : row.longShortRatio >= 1
                    ? "text-ink-gain"
                    : "text-ink-loss";
              const fundingTone =
                row.fundingRate === null
                  ? "text-ink-fg-muted"
                  : row.fundingRate >= 0
                    ? "text-ink-gain"
                    : "text-ink-loss";

              return (
                <tr key={row.symbol} className="border-t border-ink-border">
                  <td className="px-4 py-2.5 text-ink-fg-muted">{i + 1}</td>
                  <td className="px-2 py-2.5 font-semibold text-ink-fg">{row.symbol}</td>
                  <td className="px-2 py-2.5 text-ink-fg-secondary">{formatPrice(row.price)}</td>
                  <td className={`px-2 py-2.5 text-right ${changeTone}`}>
                    {isUp ? "▲" : "▼"} {Math.abs(row.changePct).toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5">
                    <Sparkline points={row.sparkline} isUp={isUp} />
                  </td>
                  <td className="px-2 py-2.5 text-right text-ink-fg-secondary">
                    {row.rsi === null ? "—" : row.rsi.toFixed(1)}
                  </td>
                  <td className={`px-2 py-2.5 text-right ${longShortTone}`}>
                    {row.longShortRatio === null ? "—" : row.longShortRatio.toFixed(2)}
                  </td>
                  <td className={`px-2 py-2.5 text-right ${fundingTone}`}>{formatFundingRate(row.fundingRate)}</td>
                  <td className="px-2 py-2.5 text-right text-ink-fg-secondary">
                    {row.poc === null ? "—" : formatPrice(row.poc)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-ink-fg-secondary">{formatVolume(row.quoteVolume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CornerFrame>
  );
}
