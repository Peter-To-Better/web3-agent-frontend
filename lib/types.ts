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
  recommendations: MarketRecommendations;
  averageRsi: number | null;
  previousAverageRsi: number | null;
  updatedAt: string;
}
