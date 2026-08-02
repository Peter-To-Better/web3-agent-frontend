---
inclusion: fileMatch
fileMatchPattern:
  - "app/api/**/*.ts"
  - "lib/api/**/*.ts"
  - "hooks/use-chat.ts"
  - "lib/agent-token.ts"
---

# API Contracts

## 共通原則

- browser 的 REST/SSE 呼叫使用同源 `/api/*`；需要秘密、上游 URL 或資料正規化的邏輯留在 Route Handler。
- 對使用者回傳安全的繁體中文錯誤；server 可記錄必要的 upstream status/error，但不得回傳 stack、verify token、環境變數或內部細節。
- 不任意改變既有 status code、request shape 或 SSE event；若必須改 contract，同步更新 route、`lib/api/*`、hooks 與 UI consumer。

## `POST /api/chat/stream`

- 使用 Node runtime、`force-dynamic`、`text/event-stream`，並關閉 proxy buffering/cache transformation。
- client body 是 `{ message, history }`；真實 Agent 分支 trim prompt、限制最多 4000 字，但刻意忽略 history，只向 Function URL 送 `{ prompt }`，每次建立新 AgentCore session。
- `AGENT_FUNCTION_URL` 未設定時回本地 mock stream。現況中空字串/長度驗證只在真實 Agent 分支；修改驗證時要明確決定是否讓 mock 與 production 一致。
- token 優先取 request 的 `X-Agent-Verify-Token`，其次取 `AGENT_FUNCTION_URL_VERIFY_TOKEN`，再以 Function URL 的 `verify` query 傳上游。禁止記錄 token。
- 上游 AgentCore event 可能是 double-encoded JSON；route 在單一邊界正規化，不把上游格式洩漏到 UI。
- 下游每個 SSE `data:` frame 是 `{ event, ... }` JSON，event 為：
  - `stage`：目前執行階段文字。
  - `stage_result`：已完成階段的決策摘要。
  - `delta`：增量文字，可帶 `section`。
  - `final`：權威完整文字，可帶第一個 `dataLimitation`；client 必須用它取代累積 delta。
  - `error`：安全錯誤訊息。
- 串流以 `data: [DONE]` 結束。業務錯誤通常仍透過 HTTP 200 的 SSE `error` event 回傳，不可只依賴非 2xx response。
- client 因 POST 與自訂 header 使用 `fetch` + `ReadableStream`，不是 EventSource；idle timeout 為 60 秒，Stop 使用 AbortController，AbortError 應靜默結束。
- 現況沒有替 malformed JSON request 自訂 400 response；若處理此缺口，需保持 SSE client 可理解的錯誤策略。

## `GET /api/chat/history`

- URL 為 `BACKEND_URL + BACKEND_CHAT_HISTORY_PATH`，path 預設 `/chat/history`，fetch 使用 `no-store`。
- `BACKEND_URL` 未設定或 upstream 回非 2xx 時回 mock history。
- 現況 fetch throw 沒有 route-level catch/timeout；不要誤稱它已完整降級。若修正，仍需保留 env-empty mock。
- route 與 `ChatHistoryList` 已存在，但 chat page 尚未接線；修改前先區分「API 可用」與「產品已整合」。

## Market routes

- `GET /api/market/dashboard` 回 server-only Binance 聚合結果；上游失敗回 502，沒有 mock。
- `GET /api/market/symbol?symbol=` 只接受 2–15 位英數 symbol；invalid input 回 400、找不到 market 回 404、上游失敗回 502。
- browser 不得為了繞過錯誤而改成直連 REST exchange API；即時公開 ticker WebSocket 的既有例外由 `hooks/use-live-prices.ts` 管理。
