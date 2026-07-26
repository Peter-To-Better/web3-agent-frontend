interface CoinAlias {
  /** Binance base asset, e.g. "BTC" (paired against USDT). */
  symbol: string;
  aliases: string[];
}

const COIN_ALIASES: CoinAlias[] = [
  { symbol: "BTC", aliases: ["btc", "bitcoin", "比特幣", "比特币"] },
  { symbol: "ETH", aliases: ["eth", "ethereum", "以太坊", "以太幣", "以太币"] },
  { symbol: "SOL", aliases: ["sol", "solana", "索拉納", "索拉纳"] },
  { symbol: "BNB", aliases: ["bnb", "幣安幣", "币安币"] },
  { symbol: "XRP", aliases: ["xrp", "ripple", "瑞波幣", "瑞波币"] },
  { symbol: "DOGE", aliases: ["doge", "dogecoin", "狗狗幣", "狗狗币"] },
  { symbol: "ADA", aliases: ["ada", "cardano", "艾達幣", "艾达币"] },
  { symbol: "AVAX", aliases: ["avax", "avalanche"] },
  { symbol: "DOT", aliases: ["dot", "polkadot", "波卡"] },
  { symbol: "MATIC", aliases: ["matic", "polygon"] },
  { symbol: "LINK", aliases: ["link", "chainlink"] },
  { symbol: "TON", aliases: ["ton", "toncoin"] },
  { symbol: "SUI", aliases: ["sui"] },
  { symbol: "APT", aliases: ["apt", "aptos"] },
  { symbol: "ARB", aliases: ["arb", "arbitrum"] },
  { symbol: "OP", aliases: ["op", "optimism"] },
  { symbol: "LTC", aliases: ["ltc", "litecoin", "萊特幣", "莱特币"] },
  { symbol: "TRX", aliases: ["trx", "tron", "波場", "波场"] },
  { symbol: "SHIB", aliases: ["shib", "shiba"] },
  { symbol: "PEPE", aliases: ["pepe"] },
  { symbol: "XLM", aliases: ["xlm", "stellar"] },
  { symbol: "ATOM", aliases: ["atom", "cosmos"] },
  { symbol: "NEAR", aliases: ["near"] },
  { symbol: "FIL", aliases: ["fil", "filecoin"] },
  { symbol: "ICP", aliases: ["icp"] },
  { symbol: "UNI", aliases: ["uni", "uniswap"] },
  { symbol: "AAVE", aliases: ["aave"] },
  { symbol: "INJ", aliases: ["inj", "injective"] },
  { symbol: "SEI", aliases: ["sei"] },
  { symbol: "TIA", aliases: ["tia", "celestia"] },
  { symbol: "WLD", aliases: ["wld", "worldcoin"] },
  { symbol: "PYTH", aliases: ["pyth"] },
  { symbol: "JUP", aliases: ["jup", "jupiter"] },
];

const FLAT_ALIASES = COIN_ALIASES.flatMap((c) => c.aliases.map((alias) => ({ alias, symbol: c.symbol })));

/**
 * Best-effort detection of which coin a chat message is asking about, so we
 * know whether/what to fetch a contextual RSI + long/short indicator for
 * once the AI's answer finishes streaming. English tickers/names must match
 * a whole token (so "op" doesn't match inside "optimal"); Chinese names
 * match as a plain substring since Chinese has no word-boundary regex.
 */
export function detectSymbolFromText(text: string): string | null {
  const lower = text.toLowerCase();
  const tokens = new Set(lower.split(/[^a-z0-9]+/).filter(Boolean));

  for (const { alias, symbol } of FLAT_ALIASES) {
    if (/^[a-z0-9]+$/.test(alias)) {
      if (tokens.has(alias)) return symbol;
    } else if (text.includes(alias)) {
      return symbol;
    }
  }
  return null;
}
