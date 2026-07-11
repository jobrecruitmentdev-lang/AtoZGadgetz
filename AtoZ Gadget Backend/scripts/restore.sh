#!/bin/bash
# =================================================
# AtoZ Gadgets MySQL Restore Script
# =================================================
# Restores a backup created by backup.sh
#
# Usage:
#   chmod +x scripts/restore.sh
#   ./scripts/restore.sh backups/atoz_gadgets_db_20260708_020000.sql.gz
#
# Or restore from S3:
#   ./scripts/restore.sh s3://your-bucket/backups/mysql/atoz_gadgets_db_20260708_020000.sql.gz
# =================================================

set -euo pipefail

BACKUP_FILE="${1:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-atoz_gadgets_db}"

LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] [RESTORE]"

# ─── Validation ─────────────────────────────────────────────────────────────
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz | s3://bucket/key>"
    exit 1
fi

echo "$LOG_PREFIX ⚠️  WARNING: This will OVERWRITE the database: $DB_NAME on $DB_HOST"
echo "$LOG_PREFIX Restore source: $BACKUP_FILE"
read -p "Are you sure? Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "$LOG_PREFIX Restore cancelled."
    exit 0
fi

# ─── Download from S3 if needed ─────────────────────────────────────────────
if [[ "$BACKUP_FILE" == s3://* ]]; then
    LOCAL_FILE="/tmp/atoz_restore_$(date +%s).sql.gz"
    echo "$LOG_PREFIX Downloading from S3: $BACKUP_FILE"
    aws s3 cp "$BACKUP_FILE" "$LOCAL_FILE"
    BACKUP_FILE="$LOCAL_FILE"
    CLEANUP=true
fi

# ─── Verify integrity ───────────────────────────────────────────────────────
echo "$LOG_PREFIX Verifying backup integrity..."
if ! gzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "$LOG_PREFIX ❌ Backup file is corrupted!" >&2
    exit 1
fi
echo "$LOG_PREFIX ✅ Backup file integrity OK"

# ─── Restore ────────────────────────────────────────────────────────────────
echo "$LOG_PREFIX Restoring database: $DB_NAME..."

if [ -n "$DB_PASSWORD" ]; then
    gunzip -c "$BACKUP_FILE" | \
        MYSQL_PWD="$DB_PASSWORD" mysql \
            -h "$DB_HOST" \
            -P "$DB_PORT" \
            -u "$DB_USER" \
            "$DB_NAME"
else
    gunzip -c "$BACKUP_FILE" | \
        mysql \
            -h "$DB_HOST" \
            -P "$DB_PORT" \
            -u "$DB_USER" \
            "$DB_NAME"
fi

echo "$LOG_PREFIX ✅ Database restored successfully from: $BACKUP_FILE"

# ─── Cleanup temp file ───────────────────────────────────────────────────────
if [ "${CLEANUP:-false}" = "true" ] && [ -f "$LOCAL_FILE" ]; then
    rm -f "$LOCAL_FILE"
fi

echo "$LOG_PREFIX Restore completed."
