export interface GaugeReading {
  title: string;
  value: number;
  previousValue: number;
  zones: [string, string, string, string, string];
}

export const fearGreedReading: GaugeReading = {
  title: "恐懼貪婪指數",
  value: 29,
  previousValue: 30,
  zones: ["極度恐懼", "恐懼", "中性", "貪婪", "極度貪婪"],
};

export const marketRsiReading: GaugeReading = {
  title: "市場平均 RSI",
  value: 44.7,
  previousValue: 43.2,
  zones: ["超賣", "偏弱", "中性", "偏強", "超買"],
};

export interface RecommendationRow {
  symbol: string;
  price: string;
  strength: number;
  changePct: number;
}

export const longRecommendations: RecommendationRow[] = [
  { symbol: "VIRTUAL", price: "$0.6483", strength: 82, changePct: 6.5 },
  { symbol: "PUMP", price: "$0.001982", strength: 76, changePct: 18.1 },
  { symbol: "XPL", price: "$0.08384", strength: 68, changePct: 2.6 },
];

export const shortRecommendations: RecommendationRow[] = [
  { symbol: "ZEC", price: "$530.03", strength: 74, changePct: -4.7 },
  { symbol: "APT", price: "$0.5852", strength: 65, changePct: -2.8 },
  { symbol: "DOT", price: "$0.8117", strength: 58, changePct: -1.8 },
];
