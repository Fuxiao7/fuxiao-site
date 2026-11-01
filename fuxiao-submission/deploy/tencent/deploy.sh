#!/usr/bin/env bash
# 拂晓的投稿系统 · 构建并部署
# 用法（以 fuxiao 用户运行）：
#   sudo -u fuxiao -H bash /srv/fuxiao/app/fuxiao-submission/deploy/tencent/deploy.sh
#
# 这个脚本处理“代码更新”：拉代码、打包后端、构建管理台、构建博客、重启服务。
# 后台点“发布到线上”只更新内容，不需要运行本脚本。

set -euo pipefail

APP_DIR="/srv/fuxiao/app"
REPO_DIR="$APP_DIR/fuxiao-submission"
API_DIR="/srv/fuxiao/api"
ADMIN_DIR="/srv/fuxiao/admin"

if [ ! -d "$REPO_DIR" ]; then
  echo "没有找到 $REPO_DIR" >&2
  exit 1
fi

if [ "$(id -un)" != "fuxiao" ]; then
  echo "请以 fuxiao 用户运行：sudo -u fuxiao -H bash $0" >&2
  exit 1
fi

cd "$APP_DIR"

# 后台发布过的内容会改写 lib/ 下的文件。拉代码前先备份，拉完再恢复，
# 避免 git pull 与“已发布内容”冲突。
CONTENT_BACKUP="$(mktemp -d)"
restore_content() {
  for file in lib/content.json lib/bodies.js lib/article-bodies.json; do
    if [ -f "$CONTENT_BACKUP/$file" ]; then
      mkdir -p "$(dirname "$file")"
      cp "$CONTENT_BACKUP/$file" "$file"
    fi
  done
}
trap 'rm -rf "$CONTENT_BACKUP"' EXIT
for file in lib/content.json lib/bodies.js lib/article-bodies.json; do
  if [ -f "$file" ]; then
    mkdir -p "$CONTENT_BACKUP/$(dirname "$file")"
    cp "$file" "$CONTENT_BACKUP/$file"
  fi
done

if [ -d .git ] && [ "${SKIP_GIT:-0}" != "1" ]; then
  echo "==> 拉取代码"
  for file in lib/content.json lib/bodies.js lib/article-bodies.json; do
    git checkout -- "$file" 2>/dev/null || true
  done
  if ! git pull --ff-only; then
    restore_content
    echo "git pull 失败，已恢复发布内容；请检查冲突后重试。" >&2
    exit 1
  fi
fi
restore_content

echo "==> 构建后端"
cd "$REPO_DIR/backend"
mvn -B -DskipTests package
install -m 644 target/fuxiao-submission-1.0.0.jar "$API_DIR/app.jar"

echo "==> 构建管理台"
cd "$REPO_DIR/admin-web"
npm ci --no-audit --no-fund
npm run build
rsync -a --delete dist/ "$ADMIN_DIR/"

echo "==> 构建博客"
cd "$APP_DIR"
npm ci --no-audit --no-fund
npm run build

echo "==> 重启服务"
sudo -n systemctl restart fuxiao-api
sudo -n systemctl restart fuxiao-blog
sudo -n systemctl reload nginx

echo "==> 健康检查"
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3100/ >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1:8080/api/public/site >/dev/null

echo
echo "部署完成："
echo "  博客      https://fuxiao.art"
echo "  管理台    https://admin.fuxiao.art"
echo "  接口      https://fuxiao.art/api"
echo
echo "之后内容更新只需要在后台点「发布到线上」。"
