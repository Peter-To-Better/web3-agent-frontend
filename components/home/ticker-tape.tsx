interface TickerItem {
  symbol: string;
  changePct: number;
}

const tickerItems: TickerItem[] = [
  { symbol: "BTC", changePct: 2.4 },
  { symbol: "ETH", changePct: -0.8 },
  { symbol: "SOL", changePct: 5.1 },
  { symbol: "BNB", changePct: 1.2 },
  { symbol: "XRP", changePct: -1.6 },
  { symbol: "DOGE", changePct: 3.7 },
  { symbol: "ADA", changePct: -0.3 },
  { symbol: "AVAX", changePct: 4.0 },
];

function TickerRow() {
  return (
    <>
      {tickerItems.map((item) => {
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

export function TickerTape() {
  return (
    <div className="overflow-hidden border-y border-ink-border bg-ink-surface" aria-hidden>
      <div className="flex w-max animate-ticker-scroll whitespace-nowrap py-2.5">
        <TickerRow />
        <TickerRow />
      </div>
    </div>
  );
}
