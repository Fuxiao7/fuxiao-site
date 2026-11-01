#!/usr/bin/env bash
# 备份 MySQL 与上传图片。建议 root 的 cron：
#   15 3 * * * /srv/fuxiao/app/fuxiao-submission/deploy/tencent/backup.sh >> /srv/fuxiao/logs/backup.log 2>&1

set -euo pipefail

ENV_FILE="/srv/fuxiao/api/.env"
BACKUP_DIR="/srv/fuxiao/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
chown fuxiao:fuxiao "$BACKUP_DIR"

# shellcheck disable=SC1090
set -a
. "$ENV_FILE"
set +a

MYSQL_PWD="${DB_PASSWORD}" mysqldump \
  --host=127.0.0.1 \
  --user="${DB_USERNAME}" \
  --single-transaction \
  --routines \
  --triggers \
  fuxiao_admin | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"

tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C /srv/fuxiao uploads

find "$BACKUP_DIR" -type f -mtime "+$RETENTION_DAYS" -delete

echo "[$STAMP] backup done: $(du -sh "$BACKUP_DIR" | cut -f1)"
