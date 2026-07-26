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

export interface SidebarPrompt {
  title: string;
  prompt: string;
}

export const sidebarPrompts: SidebarPrompt[] = [
  {
    title: "BTC 市場情緒",
    prompt: "請分析 BTC 目前的市場情緒，並整理恐懼貪婪指數、資金流向與主要風險。",
  },
  {
    title: "ETH 鏈上動態",
    prompt: "ETH 最近 24 小時的鏈上活躍度與 Gas 費趨勢如何？請說明可能原因。",
  },
  {
    title: "巨鯨資金追蹤",
    prompt: "最近 24 小時有哪些值得注意的巨鯨轉帳或交易所大額流入流出？",
  },
  {
    title: "Solana 生態趨勢",
    prompt: "Solana 生態近期有哪些值得關注的新項目、熱門賽道與鏈上趨勢？",
  },
  {
    title: "技術指標掃描",
    prompt: "目前有哪些主流代幣處於 RSI 超買或超賣區？請列出可能的風險。",
  },
  {
    title: "主流幣強弱比較",
    prompt: "請比較 BTC、ETH、SOL 最近一週的價格強弱、成交量與市場動能。",
  },
  {
    title: "多空機會分析",
    prompt: "根據即時市場數據，目前有哪些潛在做多與做空機會？請同時列出風險。",
  },
  {
    title: "本週市場事件",
    prompt: "本週有哪些宏觀事件、代幣解鎖、監管或 ETF 資金動向可能影響加密市場？",
  },
];
