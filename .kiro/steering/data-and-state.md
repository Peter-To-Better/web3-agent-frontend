---
inclusion: fileMatch
fileMatchPattern:
  - "lib/**/*.ts"
  - "hooks/**/*.ts"
  - "app/page.tsx"
  - "app/dashboard/**/*"
  - "app/report/**/*"
  - "app/share/**/*"
  - "components/home/**/*"
  - "components/dashboard/**/*"
  - "components/chat/**/*"
---

# Data and State

## 市場資料來源與快取

- Spot REST：Binance.US `https://api.binance.us`。
- Futures REST：Binance Futures `https://fapi.binance.com`。
- 即時 ticker：browser 由 `useLivePrices` 直連 `wss://stream.binance.com:9443/stream`。
- Fear & Greed：Alternative.me 公開 API。
- server fetch timeout 通常為 8 秒；market revalidate 多為 15 秒、ticker 30 秒、Fear & Greed 900 秒。
- dashboard client 約每 8 秒 completion-based poll `/api/market/dashboard`，避免 request 重疊；因 server cache 為 15 秒，連續 poll 可能取得同一份快取。
- `MarketPanel` 先使用 server initial data，再用 REST poll 更新完整資料、用 WebSocket 覆蓋 price/change。poll 失敗時保留 stale data，而不是清空畫面。
- `useLivePrices` 目前只在 unmount／symbol set 改變時關閉與重建 socket，沒有 reconnect、backoff 或 `onerror`；不要把尚未實作的韌性描述成現況。

## Client state 與 storage

- chat messages、streaming 狀態與目前輸入只存在 `useChat` 的 React state；沒有 conversation persistence、user identity 或可重用的 Agent runtime session ID。
- message id 目前由隨機值建立，不是 backend identity。
- `useChat` 依 section arrival order 累積 delta，以 typewriter 呈現；`final` 是權威內容，必須立即覆蓋 delta，避免較短 final 留下舊字串。
- 偵測到幣種後，AI 訊息完成時再呼叫同源 symbol route 補市場指標；失敗只移除 loading，不應使聊天失敗。
- localStorage keys：`agent_verify_token`、`auth_token`、`feature_tour_seen_*`。`auth_token` 的 Axios interceptor 是基礎設施，主要頁面流程目前未確認有實際 consumer。
- 存取 localStorage、WebSocket、hash 或 CompressionStream 的程式必須位於 client boundary，並處理 browser capability／decode failure。

## Share / report 資料

- 分享與報告由 client 將 payload JSON 以 deflate-raw 壓縮、base64url 編碼後放在 URL fragment；fragment 不會送到 server。
- 這個格式沒有保密性、完整性與永久性。不可放 token 或敏感資料；修改 schema 時需兼顧舊連結、無效 fragment、URL 長度與 CompressionStream 支援。
- `/share` 是唯讀顯示；`/report` 還原後自動啟動列印，並使用專用 light/A4 print styles。
