This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 使用 Docker 啟動

專案已內建 `Dockerfile`（multi-stage build，產出 Next.js standalone image）與 `docker-compose.yml`。

### 方式一：Docker Compose（推薦）

```bash
cp .env.example .env
# 編輯 .env，填入 BACKEND_URL 指向你的真實後端；留空則使用 app/api/chat/* 內建的假資料

docker compose up -d --build
docker compose logs -f web
```

啟動後開 [http://localhost:3000](http://localhost:3000) 確認。停止服務用 `docker compose down`。

### 方式二：純 Docker

```bash
docker build -t hoya-bit-frontend .
docker run --rm -p 3000:3000 \
  -e BACKEND_URL=http://your-backend:8080 \
  hoya-bit-frontend
```

`BACKEND_URL` 未設定時，`/api/chat/stream`、`/api/chat/history` 會回傳內建的 mock 資料，方便在沒有後端的情況下先驗證前端。

完整的 AWS EC2 + Nginx + TLS 部署流程請參考 [DEPLOY.md](./DEPLOY.md)。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
