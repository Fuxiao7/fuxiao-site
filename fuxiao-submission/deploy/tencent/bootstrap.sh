#!/usr/bin/env bash
# 拂晓的投稿系统 · 腾讯云 Ubuntu 24.04 初始化
# 用法（在服务器上，先把仓库放到 /srv/fuxiao/app）：
#   sudo bash /srv/fuxiao/app/fuxiao-submission/deploy/tencent/bootstrap.sh
#
# 这个脚本只做系统层准备：Nginx、MySQL、JDK、Node、Maven、用户、目录、
# 站点配置、systemd、数据库导入。不会启动应用，应用由 deploy.sh 构建后启动。

set -euo pipefail

APP_DIR="/srv/fuxiao/app"
SERVICE_USER="fuxiao"
REPO_DIR="$APP_DIR/fuxiao-submission"
DEPLOY_DIR="$REPO_DIR/deploy/tencent"
ENV_FILE="/srv/fuxiao/api/.env"

if [ "$(id -u)" -ne 0 ]; then
  echo "请用 root 运行：sudo bash $0" >&2
  exit 1
fi

if [ ! -d "$REPO_DIR" ]; then
  echo "没有找到 $REPO_DIR。" >&2
  echo "请先把仓库放到 /srv/fuxiao/app（例如 git clone 或 rsync），再运行本脚本。" >&2
  exit 1
fi

chmod +x "$DEPLOY_DIR/"*.sh

export DEBIAN_FRONTEND=noninteractive

echo "==> 安装系统软件"
apt-get update
apt-get install -y \
  nginx mysql-server openjdk-21-jdk maven git rsync ufw \
  certbot python3-certbot-nginx curl ca-certificates

echo "==> 检查 Node.js 20+"
NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
fi
if [ "$NODE_MAJOR" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node --version
npm --version

echo "==> 创建运行用户与目录"
if ! id -u "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir /srv/fuxiao --shell /bin/bash "$SERVICE_USER"
fi
mkdir -p /srv/fuxiao/{api,admin,uploads,backups,logs}
chown -R "$SERVICE_USER:$SERVICE_USER" /srv/fuxiao
chmod 755 /srv/fuxiao /srv/fuxiao/api /srv/fuxiao/admin /srv/fuxiao/uploads

echo "==> 数据库"
systemctl enable --now mysql

if [ ! -f "$ENV_FILE" ]; then
  DB_PASSWORD="$(openssl rand -hex 16)"
  JWT_SECRET="$(openssl rand -hex 48)"
  ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 16)"
  cat > "$ENV_FILE" <<EOF
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
DB_URL="jdbc:mysql://127.0.0.1:3306/fuxiao_admin?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false"
DB_USERNAME=fuxiao
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
CORS_ORIGINS=https://admin.fuxiao.art,https://fuxiao.art
UPLOAD_DIR=/srv/fuxiao/uploads
ADMIN_INIT_PASSWORD=$ADMIN_PASSWORD
PUBLISH_ENABLED=true
BLOG_DIR=/srv/fuxiao/app
BLOG_BUILD_COMMAND="/usr/bin/npm run build"
BLOG_RESTART_COMMAND="/usr/bin/sudo -n /usr/bin/systemctl restart fuxiao-blog"
BLOG_HEALTH_URL=http://127.0.0.1:3100/
BLOG_BUILD_TIMEOUT=300
TZ=Asia/Shanghai
EOF
  chmod 600 "$ENV_FILE"
  chown "$SERVICE_USER:$SERVICE_USER" "$ENV_FILE"
  GENERATED_ADMIN_PASSWORD="$ADMIN_PASSWORD"
else
  DB_PASSWORD="$(grep '^DB_PASSWORD=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"')"
  GENERATED_ADMIN_PASSWORD="$(grep '^ADMIN_INIT_PASSWORD=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"')"
  echo "已存在 $ENV_FILE，保留原配置"
fi

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "无法从 $ENV_FILE 读取 DB_PASSWORD" >&2
  exit 1
fi

mysql -uroot <<SQL
CREATE DATABASE IF NOT EXISTS fuxiao_admin
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'fuxiao'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER 'fuxiao'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON fuxiao_admin.* TO 'fuxiao'@'localhost';
CREATE USER IF NOT EXISTS 'fuxiao'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER 'fuxiao'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON fuxiao_admin.* TO 'fuxiao'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

TABLE_COUNT="$(mysql -N -B -uroot -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='fuxiao_admin' AND table_name='article'")"
if [ "$TABLE_COUNT" = "0" ]; then
  echo "==> 导入 schema.sql"
  mysql -uroot < "$REPO_DIR/db/schema.sql"
fi

ROW_COUNT="$(mysql -N -B -uroot -e "SELECT COUNT(*) FROM fuxiao_admin.article")"
if [ "$ROW_COUNT" = "0" ]; then
  echo "==> 导入演示数据 data.sql"
  mysql -uroot < "$REPO_DIR/db/data.sql"
fi

echo "==> 安装 Nginx 站点"
install -m 644 "$DEPLOY_DIR/nginx/fuxiao.art.conf" /etc/nginx/sites-available/fuxiao.art
install -m 644 "$DEPLOY_DIR/nginx/admin.fuxiao.art.conf" /etc/nginx/sites-available/admin.fuxiao.art
ln -sf /etc/nginx/sites-available/fuxiao.art /etc/nginx/sites-enabled/fuxiao.art
ln -sf /etc/nginx/sites-available/admin.fuxiao.art /etc/nginx/sites-enabled/admin.fuxiao.art
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> 安装 systemd 服务"
install -m 644 "$DEPLOY_DIR/systemd/fuxiao-api.service" /etc/systemd/system/fuxiao-api.service
install -m 644 "$DEPLOY_DIR/systemd/fuxiao-blog.service" /etc/systemd/system/fuxiao-blog.service
systemctl daemon-reload
systemctl enable fuxiao-api fuxiao-blog

echo "==> 配置发布权限"
install -m 440 "$DEPLOY_DIR/sudoers/fuxiao-publish" /etc/sudoers.d/fuxiao-publish
visudo -cf /etc/sudoers.d/fuxiao-publish

echo "==> 防火墙"
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

echo
echo "============================================================"
echo " 初始化完成。"
echo
echo " 1. 在域名服务商添加 DNS（都指向本机公网 IP）："
echo "      @      A  <公网IP>"
echo "      www    A  <公网IP>"
echo "      admin  A  <公网IP>"
echo
echo " 2. DNS 生效后申请 HTTPS："
echo "      sudo certbot --nginx -d fuxiao.art -d www.fuxiao.art -d admin.fuxiao.art"
echo
echo " 3. 构建并启动应用："
echo "      sudo -u fuxiao -H bash $REPO_DIR/deploy/tencent/deploy.sh"
echo
if [ -n "${GENERATED_ADMIN_PASSWORD:-}" ]; then
  echo " 管理台初始密码（仅首次启动生效）：$GENERATED_ADMIN_PASSWORD"
  echo " 也保存在：$ENV_FILE"
  echo
fi
echo " 4. 打开 https://admin.fuxiao.art 登录，改密码。"
echo "============================================================"
