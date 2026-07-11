#!/bin/bash
# =================================================
# AtoZ Gadgets MySQL Backup Script
# =================================================
# Features:
#   - Full MySQL dump with gzip compression
#   - Timestamped backup files
#   - Optional S3 upload
#   - Local retention policy (keeps last N backups)
#   - Sends notification on success/failure
#
# Usage:
#   chmod +x scripts/backup.sh
#   ./scripts/backup.sh
#
# Cron (daily at 2am):
#   0 2 * * * /opt/atoz/scripts/backup.sh >> /var/log/atoz_backup.log 2>&1
# =================================================

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────────────
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-atoz_gadgets_db}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_LAST="${KEEP_LAST:-7}"       # Keep last 7 backups locally

S3_BUCKET="${AWS_S3_BUCKET:-}"
S3_REGION="${AWS_S3_REGION:-ap-south-1}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/atoz_${DB_NAME}_${TIMESTAMP}.sql.gz"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] [BACKUP]"

# ─── Setup ──────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
echo "$LOG_PREFIX Starting backup: $DB_NAME → $BACKUP_FILE"

# ─── Dump + Compress ─────────────────────────────────────────────────────────
if [ -n "$DB_PASSWORD" ]; then
    MYSQL_PWD="$DB_PASSWORD" mysqldump \
        -h "$DB_HOST" \
        -P "$DB_PORT" \
        -u "$DB_USER" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --compress \
        "$DB_NAME" | gzip -9 > "$BACKUP_FILE"
else
    mysqldump \
        -h "$DB_HOST" \
        -P "$DB_PORT" \
        -u "$DB_USER" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        "$DB_NAME" | gzip -9 > "$BACKUP_FILE"
fi

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "$LOG_PREFIX Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# ─── Upload to S3 ────────────────────────────────────────────────────────────
if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    S3_KEY="backups/mysql/$(basename $BACKUP_FILE)"
    
    AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/${S3_KEY}" \
        --region "$S3_REGION" \
        --storage-class STANDARD_IA
    
    echo "$LOG_PREFIX Uploaded to S3: s3://${S3_BUCKET}/${S3_KEY}"
fi

# ─── Cleanup Old Backups ──────────────────────────────────────────────────────
echo "$LOG_PREFIX Cleaning old backups (keeping last $KEEP_LAST)..."
ls -t "${BACKUP_DIR}"/atoz_${DB_NAME}_*.sql.gz 2>/dev/null | \
    tail -n +$((KEEP_LAST + 1)) | \
    xargs -r rm --
echo "$LOG_PREFIX Cleanup done."

# ─── Verify backup integrity ─────────────────────────────────────────────────
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "$LOG_PREFIX ✅ Backup integrity verified: $BACKUP_FILE"
else
    echo "$LOG_PREFIX ❌ Backup file is corrupted!" >&2
    exit 1
fi

echo "$LOG_PREFIX Backup completed successfully."
