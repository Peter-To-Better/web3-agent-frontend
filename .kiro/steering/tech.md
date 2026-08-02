---
inclusion: always
---

# Tech

## 核心技術棧

- Next.js `16.2.10`，App Router、Turbopack，`output: "standalone"`。
- React / React DOM `19.2.4`。
- TypeScript 5 strict mode；`noEmit`、`moduleResolution: "bundler"`、`jsx: "react-jsx"`、`@/* -> ./*`。
- Tailwind CSS 4，透過 `@tailwindcss/postcss`；沒有 `tailwind.config.*`，design tokens 位於 `app/globals.css`。
- GSAP `3.15` + `@gsap/react`；plugin 集中在 `lib/gsap.ts` 註冊。
- react-joyride、react-markdown + remark-gfm/remark-breaks、dayjs、axios。
- Node.js 22；開發套件管理器固定為 `pnpm@11.18.0`。

> 這個 Next.js 版本有 breaking changes。撰寫或修改任何 Next.js API、App Router、Route Handler、metadata、cache 或 config 前，先讀 `node_modules/next/dist/docs/` 對應文件並遵守 deprecation 提示，不可憑既有記憶推測。

套件版本與 scripts 的權威來源：#[[file:package.json]]

## 套件與 lockfile

- 日常開發與 CI 使用 pnpm；安裝依賴用 `pnpm install`，CI 使用 frozen lockfile。
- Dockerfile 刻意使用 `npm ci` + `package-lock.json`。
- 任何 dependency/devDependency 變更後，依序執行 `pnpm install` 與 `npm install --package-lock-only`，並提交 `pnpm-lock.yaml`、`package-lock.json`。
- 新增依賴要使用明確、固定的版本；先確認套件名稱，避免 typo-squatting。
- `package.json` 的目前名稱是 `web3-agent-frontende`。除非任務明確要求，不要順手更名；若更名需同步兩份 lockfile。

## 指令與品質檢查

```bash
pnpm dev      # 開發伺服器 http://localhost:3000
pnpm lint     # ESLint flat config：Next core-web-vitals + TypeScript
pnpm build    # production build，包含 TypeScript 檢查
pnpm start    # 啟動 production server
```

- 一般程式變更至少依序執行 `pnpm lint`、`pnpm build`；若只改 Markdown steering，可改做內容、front matter、路徑與 diff 驗證。
- 專案沒有獨立 `typecheck` 或 `test` script，也沒有 Playwright config／CI test step；不要聲稱已執行不存在的 `pnpm test`。若任務明確要求測試，先補齊相應設定。
- 專案沒有 Prettier 設定；格式以既有 ESLint 與鄰近程式碼風格為準。

## 環境變數

全部選填，名稱與用途以 #[[file:.env.example]] 為準：

- `AGENT_FUNCTION_URL`：Lambda Function URL；空值時 chat stream 使用 mock。
- `AGENT_FUNCTION_URL_VERIFY_TOKEN`：部署層後備 verify token。
- `BACKEND_URL`：聊天歷史後端 base URL；空值時 history 使用 mock。
- `BACKEND_CHAT_HISTORY_PATH`：history path，預設 `/chat/history`。

機密變數不得加 `NEXT_PUBLIC_`、寫入 source、輸出到 client 或提交真實 `.env`。
