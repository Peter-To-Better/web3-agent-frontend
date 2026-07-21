#!/usr/bin/env bash
set -euxo pipefail

apt-get update -y
apt-get install -y ca-certificates curl gnupg nginx

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin certbot python3-certbot-nginx

usermod -aG docker ubuntu

systemctl enable --now docker
systemctl enable --now nginx

mkdir -p /opt/hoya-bit-frontend
cat > /opt/hoya-bit-frontend/README-NEXT-STEPS.txt <<'EOF'
Bootstrap complete: Docker, Docker Compose plugin, Nginx and Certbot are installed.

Next steps (see DEPLOY.md in the repo):
  1. git clone <your-repo> /opt/hoya-bit-frontend/app   (or scp the source over)
  2. cd /opt/hoya-bit-frontend/app && cp .env.example .env
  3. Edit .env and set BACKEND_URL to your real backend
  4. docker compose up -d --build
  5. sudo cp nginx.conf.example /etc/nginx/sites-available/hoya-bit-frontend
     sudo ln -s /etc/nginx/sites-available/hoya-bit-frontend /etc/nginx/sites-enabled/
     sudo nginx -t && sudo systemctl reload nginx
EOF

%{ if domain_name != "" ~}
echo "Domain configured: ${domain_name} — point its DNS A record at this instance's IP, then run: sudo certbot --nginx -d ${domain_name}" >> /opt/hoya-bit-frontend/README-NEXT-STEPS.txt
%{ endif ~}
