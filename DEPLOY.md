# 部署到 AWS EC2（Docker）

## 架構

```
瀏覽器 → Nginx (80/443, TLS) → Next.js container (:3000)
                                  ├─ Chat SPA（首頁 + /chat）
                                  └─ /api/* route handlers 作為 SSE / REST proxy → BACKEND_URL（你的真實後端）
```

`/api/chat/stream`、`/api/chat/history` 是同源的 Next.js Route Handler，會依 `BACKEND_URL` 環境變數轉發到你的真實後端；沒設定時回傳內建假資料，方便先把前端部署起來驗證。整個 SPA + proxy 都打包在同一個 Docker image 裡，不需要額外的 proxy container。

## 1. 本地建置與測試

```bash
docker build -t hoya-bit-frontend .
docker run --rm -p 3000:3000 hoya-bit-frontend
# 開 http://localhost:3000 與 http://localhost:3000/chat 確認正常
```

## 2. 準備 EC2 機器

### 選項 A：用 Terraform 自動建立（`terraform/`）

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# 編輯 terraform.tfvars：key_name、allowed_ssh_cidrs（你的 IP，不要留 0.0.0.0/0）

terraform init
terraform apply
```

會用預設 VPC 建立一台 Ubuntu 22.04 EC2（含 Security Group 只開 22/80/443、可選 Elastic IP），
並透過 user_data 自動裝好 Docker、Docker Compose plugin、Nginx、Certbot。完成後看
`terraform output ssh_command` 取得連線指令，接著跳到步驟 3。

### 選項 B：手動建立

- Ubuntu 22.04 / Amazon Linux 2023，t3.small 以上
- Security Group：對外開放 22（SSH，限自己 IP）、80、443；3000 port 不對外開放，只給 Nginx 走 loopback
- 安裝 Docker：

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt-get install -y docker-compose-plugin   # 或依發行版調整
```

## 3. 把程式碼送上機器並設定環境變數

```bash
git clone <your-repo> && cd web3-agent-frontend
cp .env.example .env
# 編輯 .env，填入 BACKEND_URL 指向你的真實後端（例如 Rust API）
```

## 4. 啟動

```bash
docker compose up -d --build
docker compose logs -f web
```

## 5. Nginx 反向代理 + TLS

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/hoya-bit-frontend
sudo ln -s /etc/nginx/sites-available/hoya-bit-frontend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

`nginx.conf.example` 特別把 `/api/chat/stream` 獨立成一個 location，關掉 `proxy_buffering`，否則 Nginx 預設會把 SSE 整批緩衝送出，前端就看不到逐字輸出的效果。

## 更新部署

```bash
git pull
docker compose up -d --build
```

`restart: unless-stopped` 已設定，機器重開機後 container 會自動起來。
