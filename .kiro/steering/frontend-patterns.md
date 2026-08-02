---
inclusion: fileMatch
fileMatchPattern:
  - "app/**/*.tsx"
  - "components/**/*.tsx"
  - "hooks/**/*.ts"
  - "app/globals.css"
  - "lib/gsap.ts"
---

# Frontend Patterns

## React 與 component 邊界

- 維持 server-first：資料頁由 Server Component 取得 initial data，再傳給必要的 client island。`/chat` 因互動與 browser APIs 是 client page；report/share 使用 server shell + client fragment decoder。
- 只有真的使用 hooks、events、browser APIs 或動畫時才加入 `"use client"`；不要把整棵頁面樹無條件 client 化。
- 跨 domain consumer 優先從 `@/components/<domain>` barrel import；domain 內部可用 relative import。
- props、API payload 與 shared state 使用明確 TypeScript 型別；共用領域型別放 `lib/types.ts`，只被單一元件使用的型別留在附近。

## Tailwind、字型與視覺 token

- Tailwind 4 由 `app/globals.css` 的 `@import "tailwindcss"` 與 `@theme inline` 驅動；顏色、字型等 token 以 CSS variables 為準，不新增 `tailwind.config.*`。
- 沿用既有 dark ink / gold / cyan 視覺語言。動態 gradient、animation delay 等無法靜態表達的值可使用少量 inline style。
- Noto Sans TC 與 JetBrains Mono 透過 `next/font/local` 從 `app/fonts` 載入，不改成 runtime 外部字型依賴。
- react-joyride 的 theme hex 目前手動對應全域 token；修改核心色票時同步檢查 tour styles。

## 動畫

- GSAP plugin 只在 `lib/gsap.ts` 註冊。React 動畫使用 `useGSAP`、scope 與自動 cleanup；ScrollTrigger／ScrambleText 不在元件內重複 register。
- 所有非必要動畫尊重 `prefersReducedMotion()`；reduced-motion 下直接呈現最終狀態，不只把 duration 調短。
- 複雜 timeline、scroll、scrub、scramble 使用 GSAP；ticker、caret、pulse、typing 等低成本循環可沿用 CSS keyframes。
- 不以 React state 驅動每幀動畫；高頻視覺更新交給 GSAP、CSS 或既有 WebSocket state 邊界。

## Markdown、列印與錯誤狀態

- AI 訊息統一使用 react-markdown + remark-gfm + remark-breaks，以及既有 markdown component mapping；不要用未清理的 raw HTML 注入回答。
- report 是唯一 light theme，維持 A4、`body:has(.report-page)`、print color adjustment 與隱藏非報告 UI 的規則。
- loading、empty、stale、streaming、aborted 與 error 是不同狀態；修改互動時不要把它們合併成單一 boolean 或讓外部資料失敗清空仍可使用的內容。
