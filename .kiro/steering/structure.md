---
inclusion: always
---

# Structure

## 目錄責任

```text
app/                         Next.js App Router 頁面、layout、全域樣式與 Route Handlers
  api/chat/stream/           POST SSE proxy；AgentCore 或本地 mock
  api/chat/history/          GET REST proxy；backend 或 mock history
  api/market/dashboard/      GET Binance 聚合資料，無 mock
  api/market/symbol/         GET 單一幣種資料，無 mock
  chat/ dashboard/           互動聊天與市場頁
  report/ share/             從 URL fragment 還原資料的頁面
  fonts/                     自架 Noto Sans TC、JetBrains Mono
components/                  UI 元件，依 chat/common/dashboard/home/layout/tour 分域
hooks/                       client hooks，例如 use-chat、use-live-prices
lib/
  api/                       browser HTTP、REST、SSE client 封裝
  agent-token.ts             Agent token 的 browser storage/header
  chat-export.ts             報告與分享匯出入口
  share-link.ts              fragment 壓縮、編碼與解碼
  market-data.ts             server-only Binance REST 聚合
  fear-greed.ts              server-only Fear & Greed 資料
  coin-symbols.ts            幣種辨識與 metadata
  date-time.ts               共用日期時間格式
  feature-tour.ts            tour 狀態與版本
  gsap.ts                    GSAP plugin 註冊與 reduced-motion helper
  types.ts                   跨領域共用型別
  *-data.ts(x)               靜態文案、導覽與 mock/display data
public/                      靜態資源；即使為空也保留 `.gitkeep` 供 Docker COPY
```

## 命名與 import

- `components/`、`hooks/` 檔名使用 kebab-case；匯出元件用 PascalCase，hook/function 用 camelCase。
- Next.js App Router 保留檔名（`page.tsx`、`layout.tsx`、`route.ts`、`loading.tsx`、`error.tsx` 等）與 `globals.css` 不可改名。
- 每個 `components/<domain>/` 維持 `index.ts` barrel；新增、移除或搬動元件時同步 export。
- 跨目錄或 repo-root 依賴使用 `@/` alias；同資料夾 sibling 與 barrel 內部使用 `./...`，不要為了形式強制改成 alias。
- 程式碼沿用雙引號、分號與 2-space indentation。

## Server / client 邊界

- page/layout 預設維持 Server Component。只有使用 React client hooks、DOM、`window`、localStorage、WebSocket、GSAP、Joyride 或 URL hash 時才加入 `"use client"`。
- server page 先取得可快取的初始資料，再以 serializable props 交給小型 client island；不要把 server-only module 拉進 client graph。
- `lib/market-data.ts` 與 `lib/fear-greed.ts` 使用 `server-only`，只能由 Server Component 或 Route Handler 引用。
- 外部 REST、SSE 與需要秘密的服務由 `app/api/*` 代理，browser 呼叫同源 API。Binance 公開 WebSocket 是目前明確的 client-side 例外。
- mock fallback 只存在 chat stream/history；market routes 沒有 mock。新增 fallback 前先確認產品需求，不要假設每個 proxy 都應回假資料。

## UI 與動畫邊界

- 複雜進場、scroll/scrub、scramble 與需要 cleanup 的動畫使用 `lib/gsap.ts` + `useGSAP`，設定 scope 並尊重 `prefersReducedMotion()`。
- ticker、caret、pulse、typing 等小型循環效果可使用 `app/globals.css` keyframes；不得把「所有動畫都用 GSAP」當成現況。
- design token、print 規則與全域 animation 位於 `app/globals.css`；不要新增 Tailwind config 來重複定義。
