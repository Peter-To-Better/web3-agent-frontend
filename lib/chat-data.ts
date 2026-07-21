export interface WelcomeCard {
  title: string;
  prompt: string;
}

export const welcomeCards: WelcomeCard[] = [
  { title: "市場情緒", prompt: "BTC 目前的市場情緒怎麼樣？" },
  { title: "鏈上分析", prompt: "ETH 鏈上活躍度如何？" },
  { title: "大戶追蹤", prompt: "最近有哪些大額轉帳？" },
  { title: "趨勢預測", prompt: "SOL 未來一週走勢分析" },
];

export const suggestedPrompts: string[] = [
  "BTC 大戶最近在做什麼？",
  "ETH 的 Gas 費趨勢",
  "Solana 生態有哪些新項目？",
  "恐懼貪婪指數歷史對比",
];
