import "server-only";
import type { MarketDashboardData, MarketRankingRow, RecommendationRow, TickerQuote } from "@/lib/types";

const SPOT_BASE = "https://api.binance.us";
const FUTURES_BASE = "https://fapi.binance.com";
const TOP_N = 5;
const MIN_QUOTE_VOLUME_USDT = 50_000;
const RSI_PERIOD = 14;
const KLINE_INTERVAL = "1h";
const KLINE_LIMIT = 100;
const LEVERAGED_TOKEN_PATTERN = /^[A-Z0-9]+(UP|DOWN|BULL|BEAR)USDT$/;

// `type=MINI` — skips priceChangePercent/bid/ask (we don't need them) and
// keeps the ~3.6k-symbol payload under Next's 2MB Data Cache item limit, so
// the revalidate hint below actually caches instead of failing silently.
interface BinanceMiniTicker24hr {
  symbol: string;
  openPrice: string;
  lastPrice: string;
  quoteVolume: string;
}

interface BinanceLongShortRatio {
  longShortRatio: string;
}

interface BinancePremiumIndex {
  lastFundingRate: string;
}

interface BinanceTicker24hrSingle {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

function fetchJson<T>(url: string, revalidateSeconds?: number): Promise<T> {
  return fetch(url, {
    signal: AbortSignal.timeout(8000),
    ...(revalidateSeconds !== undefined
      ? { next: { revalidate: revalidateSeconds } }
      : { cache: "no-store" as RequestCache }),
  }).then((res) => {
    if (!res.ok) throw new Error(`Binance API ${url} failed: HTTP ${res.status}`);
    return res.json() as Promise<T>;
  });
}

/** Wilder's smoothed RSI over the given closes; null if there isn't enough history. */
function computeRsi(closes: number[], period = RSI_PERIOD): number | null {
  if (closes.length < period + 1) return null;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) avgGain += change;
    else avgLoss += -change;
  }
  avgGain /= period;
  avgLoss /= period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

const POC_BIN_COUNT = 24;

/**
 * Point of Control — approximated from kline OHLCV since Binance doesn't
 * expose a volume-profile endpoint: bucket each candle's typical price
 * ((high+low+close)/3) into POC_BIN_COUNT bins across the observed price
 * range, weight by that candle's volume, and take the bin with the most
 * cumulative volume. Coarser than a true tick-level volume profile, but a
 * reasonable approximation from hourly candles.
 */
function computePoc(candles: Array<{ high: number; low: number; close: number; volume: number }>): number | null {
  if (!candles.length) return null;

  const minPrice = Math.min(...candles.map((c) => c.low));
  const maxPrice = Math.max(...candles.map((c) => c.high));
  if (!(maxPrice > minPrice)) return candles[candles.length - 1].close;

  const binSize = (maxPrice - minPrice) / POC_BIN_COUNT;
  const volumeByBin = new Array(POC_BIN_COUNT).fill(0) as number[];

  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const bin = Math.min(POC_BIN_COUNT - 1, Math.floor((typicalPrice - minPrice) / binSize));
    volumeByBin[bin] += c.volume;
  }

  let maxBin = 0;
  for (let i = 1; i < POC_BIN_COUNT; i++) {
    if (volumeByBin[i] > volumeByBin[maxBin]) maxBin = i;
  }

  return minPrice + binSize * (maxBin + 0.5);
}

interface TopMover {
  symbol: string;
  lastPrice: number;
  changePct: number;
  quoteVolume: number;
}

/** All qualifying USDT pairs, sorted descending by 24h % change (biggest gainers first). */
async function fetchAllMovers(): Promise<TopMover[]> {
  const all = await fetchJson<BinanceMiniTicker24hr[]>(`${SPOT_BASE}/api/v3/ticker/24hr?type=MINI`, 15);

  return all
    .filter(
      (t) =>
        t.symbol.endsWith("USDT") &&
        !LEVERAGED_TOKEN_PATTERN.test(t.symbol) &&
        parseFloat(t.quoteVolume) > MIN_QUOTE_VOLUME_USDT
    )
    .map((t) => {
      const open = parseFloat(t.openPrice);
      const last = parseFloat(t.lastPrice);
      const quoteVolume = parseFloat(t.quoteVolume);
      return {
        symbol: t.symbol,
        lastPrice: last,
        changePct: open ? ((last - open) / open) * 100 : 0,
        quoteVolume,
      };
    })
    .sort((a, b) => b.changePct - a.changePct);
}

const SPARKLINE_POINTS = 24;

interface KlineIndicators {
  rsi: number | null;
  previousRsi: number | null;
  poc: number | null;
  /** Last SPARKLINE_POINTS hourly closes (oldest first), for an inline mini trend chart. */
  sparkline: number[] | null;
}

const EMPTY_KLINE_INDICATORS: KlineIndicators = { rsi: null, previousRsi: null, poc: null, sparkline: null };

async function fetchKlineIndicators(symbol: string): Promise<KlineIndicators> {
  try {
    const klines = await fetchJson<unknown[][]>(
      `${SPOT_BASE}/api/v3/klines?symbol=${symbol}&interval=${KLINE_INTERVAL}&limit=${KLINE_LIMIT}`,
      15
    );
    const candles = klines.map((k) => ({
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
    }));
    const closes = candles.map((c) => c.close);

    return {
      rsi: computeRsi(closes),
      // Same series with the last 24 hourly candles dropped — RSI as of ~24h ago.
      previousRsi: computeRsi(closes.slice(0, Math.max(0, closes.length - 24))),
      poc: computePoc(candles),
      sparkline: closes.slice(-SPARKLINE_POINTS),
    };
  } catch {
    return EMPTY_KLINE_INDICATORS;
  }
}

async function fetchLongShortRatio(symbol: string): Promise<number | null> {
  try {
    const rows = await fetchJson<BinanceLongShortRatio[]>(
      `${FUTURES_BASE}/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=5m&limit=1`,
      15
    );
    const value = rows[0] ? parseFloat(rows[0].longShortRatio) : NaN;
    return Number.isFinite(value) ? value : null;
  } catch {
    // Most likely this symbol has no USDⓈ-M futures market — not an error.
    return null;
  }
}

/** Last funding rate (fraction, e.g. 0.0001 = 0.01%) for the symbol's USDⓈ-M perpetual, if one exists. */
async function fetchFundingRate(symbol: string): Promise<number | null> {
  try {
    const row = await fetchJson<BinancePremiumIndex>(`${FUTURES_BASE}/fapi/v1/premiumIndex?symbol=${symbol}`, 15);
    const value = parseFloat(row.lastFundingRate);
    return Number.isFinite(value) ? value : null;
  } catch {
    // Most likely this symbol has no USDⓈ-M futures market — not an error.
    return null;
  }
}

function average(values: Array<number | null>): number | null {
  const present = values.filter((v): v is number => v !== null);
  if (!present.length) return null;
  return present.reduce((sum, v) => sum + v, 0) / present.length;
}

async function withIndicators(mover: TopMover): Promise<{ row: MarketRankingRow; previousRsi: number | null }> {
  const [kline, longShortRatio, fundingRate] = await Promise.all([
    fetchKlineIndicators(mover.symbol),
    fetchLongShortRatio(mover.symbol),
    fetchFundingRate(mover.symbol),
  ]);
  return {
    row: {
      symbol: mover.symbol.replace(/USDT$/, ""),
      price: mover.lastPrice,
      changePct: mover.changePct,
      rsi: kline.rsi,
      longShortRatio,
      poc: kline.poc,
      fundingRate,
      quoteVolume: mover.quoteVolume,
      sparkline: kline.sparkline,
    },
    previousRsi: kline.previousRsi,
  };
}

/**
 * RSI doubles as a "signal strength" for the recommendation tables: a high
 * RSI reflects strong recent buying momentum (good long signal), a low RSI
 * reflects strong recent selling pressure / oversold (good short signal).
 */
function toRecommendation(row: MarketRankingRow, direction: "long" | "short"): RecommendationRow {
  const rsi = row.rsi ?? 50;
  const strength = Math.round(direction === "long" ? rsi : 100 - rsi);
  return {
    symbol: row.symbol,
    price: row.price,
    changePct: row.changePct,
    strength: Math.max(0, Math.min(100, strength)),
  };
}

export async function getMarketDashboardData(): Promise<MarketDashboardData> {
  const allMovers = await fetchAllMovers();
  const topGainerMovers = allMovers.slice(0, TOP_N);
  const topLoserMovers = allMovers.slice(-TOP_N).reverse();
  const topVolumeMovers = [...allMovers].sort((a, b) => b.quoteVolume - a.quoteVolume).slice(0, TOP_N);

  const [gainerResults, loserResults, volumeResults] = await Promise.all([
    Promise.all(topGainerMovers.map(withIndicators)),
    Promise.all(topLoserMovers.map(withIndicators)),
    Promise.all(topVolumeMovers.map(withIndicators)),
  ]);

  return {
    gainers: gainerResults.map((r) => r.row),
    losers: loserResults.map((r) => r.row),
    volumes: volumeResults.map((r) => r.row),
    recommendations: {
      long: gainerResults.slice(0, 3).map((r) => toRecommendation(r.row, "long")),
      short: loserResults.slice(0, 3).map((r) => toRecommendation(r.row, "short")),
    },
    averageRsi: average(gainerResults.map((r) => r.row.rsi)),
    previousAverageRsi: average(gainerResults.map((r) => r.previousRsi)),
    updatedAt: new Date().toISOString(),
  };
}

/** Fixed watchlist for the homepage/dashboard scrolling ticker tape. */
export const TICKER_TAPE_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX"] as const;

/**
 * Price + 24h change for a small fixed set of major coins, in one batched
 * request — used to seed the ticker tape before its WebSocket ticks take
 * over. Unlike getMarketDashboardData/getSymbolIndicators this skips RSI/
 * long-short/POC entirely since the ticker tape never displays them.
 */
export async function getTickerSnapshot(
  baseSymbols: readonly string[] = TICKER_TAPE_SYMBOLS
): Promise<TickerQuote[]> {
  const pairs = baseSymbols.map((s) => `${s.toUpperCase()}USDT`);
  try {
    const symbolsParam = encodeURIComponent(JSON.stringify(pairs));
    const rows = await fetchJson<BinanceTicker24hrSingle[]>(
      `${SPOT_BASE}/api/v3/ticker/24hr?symbols=${symbolsParam}`,
      30
    );
    const bySymbol = new Map(rows.map((r) => [r.symbol, r]));
    return baseSymbols.flatMap((base) => {
      const row = bySymbol.get(`${base.toUpperCase()}USDT`);
      if (!row) return [];
      return [{ symbol: base.toUpperCase(), price: parseFloat(row.lastPrice), changePct: parseFloat(row.priceChangePercent) }];
    });
  } catch (error) {
    console.error("Ticker snapshot fetch failed", error);
    return [];
  }
}

/**
 * RSI + long/short ratio for one arbitrary coin (e.g. whichever symbol a
 * chat message was detected to be about) — unlike getMarketDashboardData,
 * this isn't limited to the top-5 movers. Returns null if the symbol has no
 * USDT spot market on Binance.
 */
export async function getSymbolIndicators(baseSymbol: string): Promise<MarketRankingRow | null> {
  const symbol = `${baseSymbol.toUpperCase()}USDT`;

  let ticker: BinanceTicker24hrSingle;
  try {
    ticker = await fetchJson<BinanceTicker24hrSingle>(`${SPOT_BASE}/api/v3/ticker/24hr?symbol=${symbol}`, 15);
  } catch {
    return null;
  }

  const [kline, longShortRatio, fundingRate] = await Promise.all([
    fetchKlineIndicators(symbol),
    fetchLongShortRatio(symbol),
    fetchFundingRate(symbol),
  ]);

  return {
    symbol: baseSymbol.toUpperCase(),
    price: parseFloat(ticker.lastPrice),
    changePct: parseFloat(ticker.priceChangePercent),
    rsi: kline.rsi,
    longShortRatio,
    poc: kline.poc,
    fundingRate,
    quoteVolume: Number.isFinite(parseFloat(ticker.quoteVolume)) ? parseFloat(ticker.quoteVolume) : null,
    sparkline: kline.sparkline,
  };
}
