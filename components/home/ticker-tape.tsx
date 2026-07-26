"use client";

import { useLivePrices } from "@/hooks/use-live-prices";
import type { TickerQuote } from "@/lib/types";

interface TickerTapeProps {
  initialQuotes: TickerQuote[];
}

function TickerRow({ quotes }: { quotes: TickerQuote[] }) {
  return (
    <>
      {quotes.map((item) => {
        const isUp = item.changePct >= 0;
        return (
          <span
            key={item.symbol}
            className="inline-flex items-center gap-2 px-6 font-mono text-xs text-ink-fg-secondary"
          >
            <span className="font-medium text-ink-fg">{item.symbol}</span>
            <span className={isUp ? "text-ink-gain" : "text-ink-loss"}>
              {isUp ? "▲" : "▼"} {Math.abs(item.changePct).toFixed(1)}%
            </span>
          </span>
        );
      })}
    </>
  );
}

export function TickerTape({ initialQuotes }: TickerTapeProps) {
  const symbols = initialQuotes.map((q) => q.symbol);
  const live = useLivePrices(symbols);
  const quotes = initialQuotes.map((q) => (live[q.symbol] ? { ...q, ...live[q.symbol] } : q));

  if (!quotes.length) return null;

  return (
    <div className="overflow-hidden border-y border-ink-border bg-ink-surface" aria-hidden>
      <div className="flex w-max animate-ticker-scroll whitespace-nowrap py-2.5">
        <TickerRow quotes={quotes} />
        <TickerRow quotes={quotes} />
      </div>
    </div>
  );
}
