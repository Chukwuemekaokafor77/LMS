#!/usr/bin/env bash
#
# db-backup.sh — logical backup of the Academy Postgres database.
#
# Complements DO Managed Postgres' automatic daily physical backups with a
# portable, restorable logical dump (pg_dump custom format) you can move
# off-provider and restore anywhere. Idempotent, safe to run on a schedule.
#
# Usage:
#   DATABASE_URL=postgres://user:pass@host:5432/db ./scripts/db-backup.sh
#
# Env:
#   DATABASE_URL   (required) Postgres connection string.
#   BACKUP_DIR     (default ./backups) where dumps are written.
#   RETENTION_DAYS (default 14) local dumps older than this are pruned.
#   S3_DEST        (optional) e.g. s3://academy-backups-prod/pg — if set, the
#                  dump is uploaded with `aws s3 cp` (works for AWS S3 or, with
#                  AWS_ENDPOINT_URL_S3, DO Spaces). Off-provider copy = real DR.
#
set -euo pipefail

: "${DATABASE_URL:?set DATABASE_URL}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

command -v pg_dump >/dev/null || { echo "pg_dump not found (install postgresql-client)"; exit 1; }

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%d_%H%M%SZ)"
OUT="$BACKUP_DIR/academy_${STAMP}.dump"

echo "[backup] dumping → $OUT"
# -Fc custom format (compressed, selective restore), --no-owner/--no-privileges
# so the dump restores cleanly under a different role on the drill server.
pg_dump "$DATABASE_URL" -Fc --no-owner --no-privileges -f "$OUT"

SIZE="$(wc -c < "$OUT" | tr -d ' ')"
SHA="$( { sha256sum "$OUT" 2>/dev/null || shasum -a 256 "$OUT"; } | cut -d' ' -f1)"
echo "[backup] ok: ${SIZE} bytes, sha256=${SHA}"
echo "$SHA  $(basename "$OUT")" >> "$BACKUP_DIR/SHA256SUMS"

if [ -n "${S3_DEST:-}" ]; then
  command -v aws >/dev/null || { echo "aws cli not found but S3_DEST set"; exit 1; }
  echo "[backup] uploading → ${S3_DEST%/}/$(basename "$OUT")"
  aws s3 cp "$OUT" "${S3_DEST%/}/$(basename "$OUT")"
fi

echo "[backup] pruning local dumps older than ${RETENTION_DAYS}d"
find "$BACKUP_DIR" -name 'academy_*.dump' -type f -mtime +"$RETENTION_DAYS" -print -delete || true

echo "[backup] done."
