import { CornerFrame } from "@/components/common";
import type { MarketRankingRow } from "@/lib/types";

function rsiZoneLabel(rsi: number): string {
  if (rsi < 30) return "超賣";
  if (rsi < 45) return "偏弱";
  if (rsi < 55) return "中性";
  if (rsi < 70) return "偏強";
  return "超買";
}

function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")}`;
}

function formatFundingRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${rate >= 0 ? "+" : ""}${(rate * 100).toFixed(4)}%`;
}

interface MarketIndicatorCardProps {
  indicator: MarketRankingRow;
}

export function MarketIndicatorCard({ indicator }: MarketIndicatorCardProps) {
  const isUp = indicator.changePct >= 0;
  const changeTone = isUp ? "text-ink-gain" : "text-ink-loss";
  const longShortTone =
    indicator.longShortRatio === null
      ? "text-ink-fg-muted"
      : indicator.longShortRatio >= 1
        ? "text-ink-gain"
        : "text-ink-loss";
  const fundingTone =
    indicator.fundingRate === null
      ? "text-ink-fg-muted"
      : indicator.fundingRate >= 0
        ? "text-ink-gain"
        : "text-ink-loss";

  return (
    <CornerFrame className="border border-ink-border bg-ink-surface">
      <div className="flex items-center justify-between border-b border-ink-border px-4 py-2.5">
        <span className="text-sm font-semibold text-ink-fg">{indicator.symbol}</span>
        <span className={`font-mono text-xs ${changeTone}`}>
          {isUp ? "▲" : "▼"} {Math.abs(indicator.changePct).toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 py-3 font-mono text-[12px] sm:grid-cols-5">
        <div>
          <div className="text-[10px] text-ink-fg-muted">價格</div>
          <div className="mt-0.5 text-ink-fg-secondary">{formatPrice(indicator.price)}</div>
        </div>
        <div>
          <div className="text-[10px] text-ink-fg-muted">多空比</div>
          <div className={`mt-0.5 ${longShortTone}`}>
            {indicator.longShortRatio === null ? "—" : indicator.longShortRatio.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ink-fg-muted">RSI(14)</div>
          <div className="mt-0.5 text-ink-fg-secondary">
            {indicator.rsi === null ? "—" : indicator.rsi.toFixed(1)}
            {indicator.rsi !== null && (
              <span className="ml-1 text-[10px] text-ink-fg-muted">{rsiZoneLabel(indicator.rsi)}</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ink-fg-muted">POC</div>
          <div className="mt-0.5 text-ink-fg-secondary">
            {indicator.poc === null ? "—" : formatPrice(indicator.poc)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ink-fg-muted">資金費率</div>
          <div className={`mt-0.5 ${fundingTone}`}>{formatFundingRate(indicator.fundingRate)}</div>
        </div>
      </div>
    </CornerFrame>
  );
}
