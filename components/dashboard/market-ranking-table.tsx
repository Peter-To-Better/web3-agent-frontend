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

type Mode = "gainers" | "losers";

interface MarketRankingTableProps {
  gainers: MarketRankingRow[];
  losers: MarketRankingRow[];
  onRefresh: () => void;
  refreshing: boolean;
}

export function MarketRankingTable({ gainers, losers, onRefresh, refreshing }: MarketRankingTableProps) {
  const [mode, setMode] = useState<Mode>("gainers");
  const isGainers = mode === "gainers";
  const rows = isGainers ? gainers : losers;

  return (
    <CornerFrame className="border border-ink-border bg-ink-surface">
      <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
        <span className="text-sm font-semibold text-ink-fg">
          {isGainers ? "🔥" : "🧊"} 24h {isGainers ? "漲幅" : "跌幅"}排行（前 5 名）
        </span>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-ink-border p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setMode("gainers")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                isGainers ? "bg-ink-gain/15 text-ink-gain" : "text-ink-fg-muted hover:text-ink-fg"
              }`}
            >
              漲幅
            </button>
            <button
              type="button"
              onClick={() => setMode("losers")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                !isGainers ? "bg-ink-loss/15 text-ink-loss" : "text-ink-fg-muted hover:text-ink-fg"
              }`}
            >
              跌幅
            </button>
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
      <table className="w-full font-mono text-[13px]">
        <thead>
          <tr className="text-left text-[11px] text-ink-fg-muted">
            <th className="w-8 px-4 py-2 font-normal">#</th>
            <th className="px-2 py-2 font-normal">幣種</th>
            <th className="px-2 py-2 font-normal">價格</th>
            <th className="px-2 py-2 text-right font-normal">24h 漲跌</th>
            <th className="px-2 py-2 text-right font-normal">RSI(14)</th>
            <th className="px-4 py-2 text-right font-normal">多空比</th>
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

            return (
              <tr key={row.symbol} className="border-t border-ink-border">
                <td className="px-4 py-2.5 text-ink-fg-muted">{i + 1}</td>
                <td className="px-2 py-2.5 font-semibold text-ink-fg">{row.symbol}</td>
                <td className="px-2 py-2.5 text-ink-fg-secondary">{formatPrice(row.price)}</td>
                <td className={`px-2 py-2.5 text-right ${changeTone}`}>
                  {isUp ? "▲" : "▼"} {Math.abs(row.changePct).toFixed(1)}%
                </td>
                <td className="px-2 py-2.5 text-right text-ink-fg-secondary">
                  {row.rsi === null ? "—" : row.rsi.toFixed(1)}
                </td>
                <td className={`px-4 py-2.5 text-right ${longShortTone}`}>
                  {row.longShortRatio === null ? "—" : row.longShortRatio.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CornerFrame>
  );
}
