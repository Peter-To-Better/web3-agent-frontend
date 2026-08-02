---
inclusion: always
---

# Product

## 產品定位

HOYA BIT 是加密貨幣市場分析 AI Agent 前端。使用者以繁體中文向 Agent 提問，接收 AWS Bedrock AgentCore 的即時串流分析，並搭配市場儀表板、報告列印與對話分享功能。

這是黑客松參賽作品；優先順序是 demo 可用性、串流回饋、視覺完成度與外部服務失效時的優雅降級。

## 頁面與目前能力

- `/`：Landing page，包含即時行情帶、Hero、能力介紹、聊天預覽與 CTA。
- `/chat`：核心聊天頁，支援 SSE 串流、分析階段提示、停止生成、Agent token 設定、訊息匯出與關聯幣種指標。左側目前是快速提問，不是已接線的歷史對話；`ChatHistoryList` 與 history API 雖已存在，尚未整合進主流程。
- `/dashboard`：市場儀表板，呈現即時價格、漲跌排行與恐懼貪婪指數。
- `/report`：由 URL fragment 還原報告並自動開啟列印流程的 A4 版面。
- `/share`：由 URL fragment 還原的唯讀對話分享頁。

## 不可破壞的產品行為

- `AGENT_FUNCTION_URL` 未設定時，chat stream 必須保留本地 mock；`BACKEND_URL` 未設定時，chat history 必須保留 mock。這是無後端也能完整 demo 的刻意設計。
- market API 沒有假資料 fallback；失敗時由 route 回錯誤，頁面或 client 保留 stale data／降級為空資料。
- 對話目前只存在 React 記憶體 state，重新整理即消失。真實 Agent 每次請求都建立新 session；client 雖傳送 history，同源 stream route 刻意只向上游送出單一 `prompt`。
- 使用者輸入的 Agent verify token 儲存在瀏覽器 localStorage，透過 `X-Agent-Verify-Token` 傳到同源 route；伺服器端環境變數只作部署層 fallback。不得把 token 放進 client bundle、log 或分享資料。
- 瀏覽器的 REST 與 SSE 請求只呼叫同源 `/api/*`。唯一現有例外是 `useLivePrices` 直接連 Binance 公開 WebSocket 取得秒級 ticker；不要誤寫成全部交易所流量都經 server proxy。
- share/report payload 以 deflate-raw + base64url 放在 URL fragment，不經伺服器儲存。這只是編碼與壓縮，不提供加密、驗證或永久保存；不得放入秘密資料，並需考量 URL 長度與瀏覽器支援。
- 外部 Agent、後端或市場資料暫時失效時，UI 應顯示安全、可理解的中文狀態，不洩露 upstream stack、token 或內部錯誤細節。
