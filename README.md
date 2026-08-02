# HOYA BIT — Web3 AI Agent 前端

加密貨幣市場分析的 AI Agent 聊天前端:使用者在聊天介面對 AI Agent 提問,
由 AWS Bedrock AgentCore 即時串流回覆,並提供市場儀表板、分析報告與對話分享頁。

## 架構

```
瀏覽器
  └─ Next.js (App Router, standalone)
       ├─ /            Landing page(GSAP 動畫)
       ├─ /chat        AI Agent 聊天(SSE 串流)
       ├─ /dashboard   市場儀表板(價格、排行、恐懼貪婪指數)
       ├─ /report      可列印的分析報告
       ├─ /share       對話分享頁
       └─ /api/*       Route Handlers(同源 proxy,瀏覽器不直連外部服務)
            ├─ /api/chat/stream    → AGENT_FUNCTION_URL(Lambda → Bedrock AgentCore)
            ├─ /api/chat/history   → BACKEND_URL(真實後端)
            └─ /api/market/*       → Binance.US spot / Binance futures 公開 API
```

所有外部呼叫都由 Next.js Route Handler 在伺服器端代理。**對應的環境變數留空時,
chat 相關 API 會回傳內建 mock 資料** — 沒有後端也能開發與展示前端。

## 技術棧

- [Next.js 16](https://nextjs.org)(App Router + Turbopack,`output: "standalone"`)
- React 19、TypeScript 5
- Tailwind CSS 4
- GSAP + @gsap/react(動畫)、react-joyride(功能導覽)
- react-markdown + remark-gfm/remark-breaks(訊息渲染)

## 快速開始

需求:**Node.js 22**、**pnpm**(版本鎖在 `package.json` 的 `packageManager` 欄位)。

```bash
pnpm install
cp .env.example .env   # 全部留空也可以,會用內建 mock 資料
pnpm dev               # http://localhost:3000
```

### 常用指令

| 指令 | 說明 |
|---|---|
| `pnpm dev` | 開發伺服器 |
| `pnpm build` | production build(含 TypeScript 檢查) |
| `pnpm start` | 跑 production build |
| `pnpm lint` | ESLint |

## 環境變數

完整說明見 [.env.example](./.env.example)。

| 變數 | 說明 |
|---|---|
| `AGENT_FUNCTION_URL` | Lambda Function URL(前接 Bedrock AgentCore 串流)。留空 → chat 回 mock 回覆 |
| `AGENT_FUNCTION_URL_VERIFY_TOKEN` | 部署層的後備 verify token;使用者也可在聊天 UI 的設定裡自行輸入 |
| `BACKEND_URL` | 真實後端 base URL(目前用於聊天歷史)。留空 → mock 歷史 |
| `BACKEND_CHAT_HISTORY_PATH` | 聊天歷史路徑,預設 `/chat/history` |

## 專案結構

```
app/            頁面與 API Route Handlers(Next.js App Router)
components/     UI 元件,依頁面分子目錄(chat/ dashboard/ home/ layout/ common/ tour/)
hooks/          React hooks(use-chat、use-live-prices)
lib/            資料層與工具(API client、market data、GSAP 設定、型別)
```

慣例(詳見 [CLAUDE.md](./CLAUDE.md) / [AGENTS.md](./AGENTS.md)):

- `components/`、`hooks/` 檔名一律 **kebab-case**(`message-bubble.tsx`),
  匯出符號維持 PascalCase/camelCase。Next.js 保留檔名(`page.tsx` 等)不受影響。
- 這個 Next.js 版本與舊版有 breaking changes,寫程式前先讀
  `node_modules/next/dist/docs/` 內的對應文件。

## Docker

Multi-stage build,產出 Next.js standalone image。

> ⚠️ `Dockerfile` 用 `npm ci` + `package-lock.json` 安裝依賴,本機開發用 pnpm。
> **改動依賴後兩份 lockfile 都要更新**(`pnpm install` 之後再跑 `npm install --package-lock-only`)。

```bash
# Docker Compose(讀取 .env)
docker compose up -d --build

# 或純 Docker
docker build -t hoya-bit-frontend .
docker run --rm -p 3000:3000 \
  -e AGENT_FUNCTION_URL=https://xxxx.lambda-url.ap-northeast-1.on.aws/ \
  hoya-bit-frontend
```

`.env` 不會被打包進 image;runtime 環境變數要用 `-e`、compose 或 ECS task definition 傳入。

## 部署(AWS ECS)

正式環境跑在 **ECS Fargate**(cluster/service/ECR repo 都叫 `hoya-bit-frontend`)。
基礎設施建置過程見 [AWS_ECS_LAMBDA_AGENTCORE_DEPLOY.md](./AWS_ECS_LAMBDA_AGENTCORE_DEPLOY.md)。

### 手動部署

```bash
./deploy-ecs.sh v1.2.3            # tag 必須是新的(ECR 使用 immutable tags)
./deploy-ecs.sh v1.2.3 --dry-run  # 只列出將執行的動作
```

腳本會:build image(自動比對 ECS 的 CPU 架構)→ push ECR → 以現行 task definition
為底註冊新 revision(只換 image,環境變數等設定不動)→ 更新 service → 等待穩定 →
對 `/`、`/chat`、`/dashboard` 做 smoke test,失敗時印出回滾指令。
預設用本機 AWS profile `poc`,可用環境變數覆寫(`./deploy-ecs.sh --help`)。

### CI/CD(GitHub Actions)

| Workflow | 觸發 | 內容 |
|---|---|---|
| [ci.yml](./.github/workflows/ci.yml) | 每個 push / PR | `pnpm lint` + `pnpm build` |
| [deploy.yml](./.github/workflows/deploy.yml) | push 到 `main`,或手動 Run workflow | 跑 `deploy-ecs.sh` 部署到 ECS |

Deploy workflow 支援兩種 AWS 憑證模式,依 Secrets 自動選擇:

1. **OIDC role(建議)** — 設 Secret `AWS_ROLE_ARN` 為可被 GitHub OIDC assume 的
   IAM Role ARN,不需存任何金鑰。
2. **靜態金鑰(後備)** — 設 Secrets `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、
   (臨時憑證再加 `AWS_SESSION_TOKEN`)。
   ⚠️ Workshop / lab 帳號發的臨時憑證**幾小時就過期**,每次部署前要重設這三個
   Secrets;拿得到正式帳號時請改用 OIDC。

Repo Variables(Settings → Secrets and variables → Actions → Variables):

| Variable | 預設 | 目前環境 |
|---|---|---|
| `AWS_REGION` | `ap-northeast-1` | `us-west-2`(Workshop 帳號) |
| `ECR_REPOSITORY` / `ECS_CLUSTER` / `ECS_SERVICE` | `hoya-bit-frontend` | 同預設 |

用 gh CLI 更新臨時憑證:

```bash
gh secret set AWS_ACCESS_KEY_ID --body "ASIA..."
gh secret set AWS_SECRET_ACCESS_KEY --body "..."
gh secret set AWS_SESSION_TOKEN --body "..."
```
