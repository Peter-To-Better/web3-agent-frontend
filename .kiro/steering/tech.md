# Tech

## 核心技術棧

- **Next.js 16**(App Router + Turbopack,`output: "standalone"`)
- **React 19**、**TypeScript 5**(strict)
- **Tailwind CSS 4**(PostCSS plugin,無 tailwind.config;design tokens 在 `app/globals.css`)
- **GSAP + @gsap/react** — 動畫(集中設定在 `lib/gsap.ts`)
- react-joyride(功能導覽)、react-markdown + remark-gfm/remark-breaks(訊息渲染)
- dayjs、axios

> ⚠️ **這個 Next.js 版本與訓練資料中的版本有 breaking changes。**
> 寫任何 Next.js 相關程式前,先讀 `node_modules/next/dist/docs/` 內的對應文件,
> 並遵守 deprecation 提示。不要憑記憶假設 API 行為。

## 套件管理

- 開發用 **pnpm**(版本鎖在 `package.json` 的 `packageManager`),Node.js 22。
- **`Dockerfile` 用 `npm ci` + `package-lock.json`** — 改動依賴後必須同步更新
  兩份 lockfile:先 `pnpm install`,再 `npm install --package-lock-only`。

## 常用指令

```bash
pnpm dev      # 開發伺服器 http://localhost:3000
pnpm build    # production build(含 TypeScript 檢查)
pnpm lint     # ESLint(flat config)
```

## 環境變數(全部選填,見 .env.example)

- `AGENT_FUNCTION_URL` — Lambda Function URL(Bedrock AgentCore 串流);空 = mock 回覆
- `AGENT_FUNCTION_URL_VERIFY_TOKEN` — 部署層後備 verify token
- `BACKEND_URL` — 真實後端 base URL(聊天歷史);空 = mock
- `BACKEND_CHAT_HISTORY_PATH` — 預設 `/chat/history`

## 部署

- 正式環境:AWS ECS Fargate(**ARM64**、us-west-2),cluster/service/ECR 皆為
  `hoya-bit-frontend`。
- CI/CD:GitHub Actions — push 到 `main` 觸發 lint+build(ci.yml)與
  ECS 部署(deploy.yml,跑 `deploy-ecs.sh`)。
- 手動部署:`./deploy-ecs.sh <新tag>`(ECR immutable tags,tag 不可重複)。
- 基礎設施重建手冊:`AWS_ECS_LAMBDA_AGENTCORE_DEPLOY.md`(注意檔頭的現況註記)。
