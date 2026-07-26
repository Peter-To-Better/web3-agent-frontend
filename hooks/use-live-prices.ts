"use client";

import { useEffect, useState } from "react";

interface LivePrice {
  price: number;
  changePct: number;
}

interface BinanceTickerStreamEvent {
  data?: { s?: string; c?: string; P?: string };
}

const WS_URL = "wss://stream.binance.com:9443/stream";

/**
 * Subscribes to Binance's combined `@ticker` WebSocket stream for the given
 * base symbols (e.g. ["BTC", "ETH"]) — pushes ~once/sec per symbol, so price
 * and 24h change tick in real time instead of waiting on a REST poll.
 * Re-subscribes whenever the symbol set itself changes.
 */
export function useLivePrices(symbols: string[]): Record<string, LivePrice> {
  const symbolsKey = Array.from(new Set(symbols)).sort().join(",");
  const [prices, setPrices] = useState<Record<string, LivePrice>>({});

  useEffect(() => {
    const uniqueSymbols = symbolsKey ? symbolsKey.split(",") : [];
    if (!uniqueSymbols.length) return;

    const streams = uniqueSymbols.map((s) => `${s.toLowerCase()}usdt@ticker`).join("/");
    const ws = new WebSocket(`${WS_URL}?streams=${streams}`);

    ws.onmessage = (event) => {
      let msg: BinanceTickerStreamEvent;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      const symbol = msg.data?.s?.replace(/USDT$/, "");
      const price = parseFloat(msg.data?.c ?? "");
      const changePct = parseFloat(msg.data?.P ?? "");
      if (!symbol || !Number.isFinite(price) || !Number.isFinite(changePct)) return;
      setPrices((prev) => ({ ...prev, [symbol]: { price, changePct } }));
    };

    return () => ws.close();
  }, [symbolsKey]);

  return prices;
}
