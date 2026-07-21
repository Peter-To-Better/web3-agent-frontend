export interface Stat {
  value: string;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "5", suffix: "+", label: "資料來源整合" },
  { value: "<30", suffix: "s", label: "平均分析時間" },
  { value: "100", suffix: "%", label: "附帶來源引用" },
  { value: "24", suffix: "/7", label: "即時運行" },
];

export interface Capability {
  index: string;
  title: string;
  description: string;
}

export const capabilities: Capability[] = [
  {
    index: "01",
    title: "多源資料整合",
    description: "整合價格、鏈上數據、新聞、官方公告、社群情緒與總體經濟等多方來源，而非僅針對單一文章摘要。",
  },
  {
    index: "02",
    title: "有層次的推理",
    description: "清楚區分事實、推論與結論，並說明每一項證據如何支撐最終判斷，而非直接給出結論。",
  },
  {
    index: "03",
    title: "不確定性與限制說明",
    description: "當資料不足、訊號矛盾或來源可信度有限時，明確指出限制與已知盲點，而非硬給結論。",
  },
  {
    index: "04",
    title: "可回溯的證據管理",
    description: "每項關鍵結論都能回溯至具體資料來源、取得時間與引用片段，禁得起覆核。",
  },
  {
    index: "05",
    title: "具洞察的分析角度",
    description: "主動找出跨資料來源的連結、反方證據與風險因子，提出非顯而易見的市場脈絡。",
  },
];

export interface Step {
  number: string;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    number: "01",
    title: "輸入問題",
    description: "告訴 AI 你想分析的幣種和具體問題，例如「ETH 目前的鏈上活躍度如何？」",
  },
  {
    number: "02",
    title: "AI 即時蒐集",
    description: "Agent 自動從多個資料來源同步蒐集資料，進行分層推理與交叉驗證。",
  },
  {
    number: "03",
    title: "獲得報告",
    description: "收到結構化分析報告：市場判斷、信心指數、關鍵依據、來源引用，全部可追溯。",
  },
];
