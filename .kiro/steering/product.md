# Product

HOYA BIT — 加密貨幣市場分析的 AI Agent 前端。使用者透過聊天介面向 AI Agent
提問(例如「請分析 BTC」),由 AWS Bedrock AgentCore 即時串流回覆,並搭配
市場儀表板、分析報告與對話分享功能。黑客松參賽作品,重視 demo 流暢度與
視覺完成度。

## 頁面與功能

- `/` — Landing page,GSAP 動畫行銷頁(hero、能力介紹、聊天預覽、CTA)
- `/chat` — 核心功能:AI Agent 聊天,SSE 串流回覆、階段提示(stage log)、
  聊天歷史側欄、市場指標卡片、功能導覽(react-joyride)
- `/dashboard` — 市場儀表板:即時價格、漲跌排行、恐懼貪婪指數
- `/report` — 可列印的分析報告版面
- `/share` — 對話分享頁(唯讀檢視)

## 關鍵行為

- **Mock fallback 是刻意設計**:`AGENT_FUNCTION_URL` / `BACKEND_URL` 未設定時,
  `/api/chat/*` 回傳內建假資料 — 沒有後端也能完整 demo 前端,不要移除這個機制。
- 使用者可在聊天 UI 的設定圖示輸入自己的 agent verify token(存在瀏覽器,
  以 `X-Agent-Verify-Token` header 送出);伺服器端環境變數只是部署層後備。
- 瀏覽器永遠只呼叫同源 `/api/*`,不直連 Lambda、AgentCore 或交易所 API。
