export interface ChatHistoryItem {
  id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  streaming?: boolean;
  /** Live progress narration from the agent (e.g. "searching sources..."), shown before real content arrives. */
  stage?: string;
  /** Coin detected from the corresponding question (e.g. "ETH"), if any. */
  relatedSymbol?: string;
  /** RSI + long/short indicator for relatedSymbol, fetched once the answer finishes streaming. */
  marketIndicator?: MarketRankingRow | null;
  marketIndicatorLoading?: boolean;
}

export interface MarketRankingRow {
  symbol: string;
  price: number;
  changePct: number;
  /** Wilder's RSI(14) computed from 1h closes; null if not enough kline history. */
  rsi: number | null;
  /** Binance USDⓈ-M futures global long/short account ratio; null if the symbol has no futures market. */
  longShortRatio: number | null;
  /** Point of Control — the price level with the most traded volume over the recent kline window; null if not enough history. */
  poc: number | null;
  /** Binance USDⓈ-M futures last funding rate (fraction, e.g. 0.0001 = 0.01%); null if the symbol has no futures market. */
  fundingRate: number | null;
  /** 24h quote (USDT) trading volume from Binance spot ticker. */
  quoteVolume: number | null;
  /** Recent 1h closes (most recent last), for an inline mini trend chart; null if kline history wasn't available. */
  sparkline: number[] | null;
}

export interface RecommendationRow {
  symbol: string;
  price: number;
  changePct: number;
  /** 0-100, derived from RSI (higher RSI = stronger long signal, lower RSI = stronger short signal). */
  strength: number;
}

export interface MarketRecommendations {
  long: RecommendationRow[];
  short: RecommendationRow[];
}

export interface MarketDashboardData {
  gainers: MarketRankingRow[];
  losers: MarketRankingRow[];
  /** Top-N by 24h quote volume, independent of price direction. */
  volumes: MarketRankingRow[];
  recommendations: MarketRecommendations;
  averageRsi: number | null;
  previousAverageRsi: number | null;
  updatedAt: string;
}

export interface TickerQuote {
  symbol: string;
  price: number;
  changePct: number;
}

export interface FearGreedReading {
  /** 0-100, from alternative.me's crypto Fear & Greed Index. */
  value: number;
  /** Chinese classification label, e.g. "貪婪", "極度恐懼". */
  classification: string;
  /** Yesterday's reading, for a day-over-day delta; null if unavailable. */
  previousValue: number | null;
}
