# Structure

```
app/                    頁面與 API Route Handlers(Next.js App Router)
  api/chat/stream/      SSE proxy → AGENT_FUNCTION_URL(未設定時回 mock 串流)
  api/chat/history/     REST proxy → BACKEND_URL(未設定時回 mock 歷史)
  api/market/           Binance.US spot / Binance futures 公開 API proxy
  chat/ dashboard/ report/ share/   各頁面(page.tsx)
  fonts/                自架字型(Noto Sans TC、JetBrains Mono woff)
components/             UI 元件,依頁面/領域分子目錄
  chat/                 聊天相關(message-bubble、chat-input、sidebar…)
  dashboard/            儀表板(market-panel、sentiment-gauge…)
  home/                 Landing page 各區塊
  layout/               navbar、footer、top-bar
  common/               跨頁共用(button、logo、reveal、scramble-text…)
  tour/                 react-joyride 功能導覽
hooks/                  React hooks(use-chat、use-live-prices)
lib/                    資料層與工具
  api/                  HTTP/SSE client 封裝(http.ts、rest.ts、sse.ts)
  *-data.ts(x)          各頁面的靜態文案與 mock 資料
  types.ts              共用型別
public/                 靜態資源(目前為空,.gitkeep 佔位 — Dockerfile 需要它存在)
```

## 命名慣例

- `components/`、`hooks/` 檔名一律 **kebab-case**(`message-bubble.tsx`、
  `use-chat.ts`);檔案內匯出符號維持 PascalCase/camelCase
  (`export function MessageBubble`)。
- 例外:Next.js App Router 保留檔名(`page.tsx`、`layout.tsx`、`route.ts`、
  `loading.tsx`、`error.tsx` 等)與 `globals.css` 必須維持原名,改名會壞路由。
- 每個 components 子目錄有 `index.ts` barrel,新增元件記得補 export。
- Import 用 `@/` path alias(對應 repo 根目錄)。

## 架構原則

- 外部服務(Lambda、後端、交易所 API)一律由 `app/api/*` Route Handler
  在伺服器端代理;瀏覽器只打同源 API。機密環境變數不加 `NEXT_PUBLIC_`。
- 每個 proxy route 都有 mock fallback:對應環境變數未設定時回傳內建假資料。
  新增 proxy route 時遵循同樣模式。
- 動畫統一走 GSAP(`lib/gsap.ts` 註冊 plugin),React 內用 `useGSAP`。
