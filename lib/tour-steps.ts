import type { Step } from "react-joyride";

export const chatTourSteps: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "歡迎使用 HOYA BIT AI",
    content:
      "花 30 秒認識這個介面。AI Agent 會即時蒐集多源市場資料，產出附上證據、可回溯來源的分析報告。",
  },
  {
    target: '[data-tour="chat-welcome"]',
    placement: "top",
    title: "示範提問",
    content: "點任一張卡片會直接送出範例問題，適合第一次體驗完整的分析流程。",
  },
  {
    target: '[data-tour="chat-sidebar"]',
    placement: "right",
    title: "快速提問",
    content: "這裡的問題點擊後會先填入輸入框，你可以改成想問的幣種或條件，確認後再送出。",
  },
  {
    target: '[data-tour="chat-input"]',
    placement: "top",
    title: "輸入你的問題",
    content:
      "Enter 送出、Shift + Enter 換行，支援中文輸入法選字。送出後會即時看到 Agent 的分析階段與逐節報告，串流中隨時可按停止。",
  },
  {
    target: '[data-tour="chat-token"]',
    placement: "bottom",
    title: "Agent 連線設定",
    content: "在這裡設定 Agent 驗證 Token，連線部署在 AWS 上的分析 Agent。旁邊的燈號代表目前是否已設定。",
  },
  {
    target: '[data-tour="chat-dashboard-link"]',
    placement: "bottom",
    title: "數據儀表板",
    content: "切換到即時看板：Binance 排行、RSI、多空比、資金費率與恐慌貪婪指數。",
  },
];

export const dashboardTourSteps: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "數據看板導覽",
    content: "這裡所有數字都是真實即時資料——來自 Binance 現貨與合約 API，以及 alternative.me 恐慌貪婪指數。",
  },
  {
    target: '[data-tour="dash-ranking"]',
    placement: "bottom",
    title: "24 小時排行",
    content:
      "前五名標的的完整指標：價格、24h 漲跌、走勢 Sparkline、RSI(14)、多空比、資金費率、POC 與成交額。",
  },
  {
    target: '[data-tour="dash-tabs"]',
    placement: "bottom",
    title: "切換排行維度",
    content: "在漲幅、跌幅、成交額三種排行之間切換。",
  },
  {
    target: '[data-tour="dash-rsi-gauge"]',
    placement: "left",
    title: "平均 RSI 儀表",
    content: "熱門標的的平均 RSI（Wilder 平滑計算），指針呈現整體市場偏強或偏弱，並與 24 小時前比較。",
  },
  {
    target: '[data-tour="dash-freshness"]',
    placement: "left",
    title: "資料更新機制",
    content: "價格與漲跌透過 Binance WebSocket 即時跳動；RSI、多空比等重運算指標每 8 秒重新計算一次。",
  },
  {
    target: '[data-tour="dash-fng-gauge"]',
    placement: "left",
    title: "恐慌貪婪指數",
    content: "來自 alternative.me 的市場情緒指標：0 代表極度恐懼、100 代表極度貪婪。",
  },
  {
    target: '[data-tour="dash-chat-link"]',
    placement: "bottom",
    title: "帶著問題回到對話",
    content: "看到有趣的訊號？點這裡回到 AI Agent，直接問它「為什麼」。",
  },
];
