---
inclusion: manual
---

# Deployment

需要處理 AWS、ECS、ECR、Docker、GitHub Actions 或正式環境時，以 `#deployment` 手動載入本檔。

完整現況、目標架構與重建步驟：#[[file:AWS_ECS_LAMBDA_AGENTCORE_DEPLOY.md]]

## 目前正式環境

- AWS ECS Fargate，cluster/service/ECR 皆為 `hoya-bit-frontend`。
- 目前專案狀態與部署資源在 `us-west-2`，正式 task 使用 ARM64。
- workflow/script 的 region fallback 仍可能是 `ap-northeast-1`；部署前必須以 repo variable、AWS account 現況與 task definition 確認 `AWS_REGION`，不可把 fallback 當成正式環境事實。
- Agent 現況是公開 Lambda Function URL + verify token；私有 IAM invocation 是目標架構，不可直接把手冊正文中的目標狀態描述成已完成。

## Container

- Dockerfile 使用 Node 22 Alpine 多階段 build、`npm ci`、Next standalone output、non-root uid/gid 1001，監聽 `0.0.0.0:3000`。
- `public/` 即使沒有資產也必須存在，Docker COPY 依賴 `.gitkeep`。
- Docker build 依賴 `package-lock.json`；dependency 變更必須同步 pnpm/npm 兩份 lockfile。
- 目前 Dockerfile 沒有 `HEALTHCHECK`。不要聲稱 image 自帶健康檢查；ECS／ALB health check 屬外部設定。

## CI/CD

- `.github/workflows/ci.yml`：所有 PR 與 push 到 `main` 時執行 pnpm frozen install、lint、build。
- `.github/workflows/deploy.yml`：push 到 `main` 或手動 dispatch 時建置 ARM image 並部署 ECS；OIDC 優先，臨時 static credentials 只作 fallback。
- CI 與 deploy 是兩個獨立的 `main` push workflow，deploy 目前沒有等待 CI 成功的 gate；修改 pipeline 時要明確處理這個風險。
- 自動 image tag 格式為 `gha-<run>-<sha7>`；ECR tag immutable，不可重用已存在的 tag。
- `deploy-ecs.sh` 讀取現有 task definition 決定架構，只替換 image 並保留 roles/env；部署後等待 service stable，smoke test `/`、`/chat`、`/dashboard`。

## 手動部署與安全

```bash
./deploy-ecs.sh <全新且未使用的-tag>
```

正式部署會變更雲端服務與流量，執行前需取得明確確認，核對 AWS account、region、cluster、service、image tag 與 rollback 版本。不得把 credential、verify token 或 `.env` 內容寫入 image、workflow log 或 repository。
