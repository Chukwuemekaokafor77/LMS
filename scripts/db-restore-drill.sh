#!/usr/bin/env bash
#
# db-restore-drill.sh — prove a backup actually restores (Phase E item 3).
#
# A backup you have never restored is not a backup. This restores a dump into a
# throwaway scratch database on the target server, verifies the schema + key
# tables are readable, reports row counts, and drops the scratch DB. Run it
# quarterly (and after any schema change) so the recovery path is known-good.
#
# Usage:
#   DATABASE_URL=postgres://user:pass@host:5432/db ./scripts/db-restore-drill.sh [dumpfile]
#   (no dumpfile → newest ./backups/academy_*.dump)
#
# Safety: the scratch DB is a uniquely-named sibling (academy_restore_drill_*).
# The production database itself is only ever READ (for its name) — never
# written or dropped. Pass --keep to leave the scratch DB for inspection.
#
set -euo pipefail

: "${DATABASE_URL:?set DATABASE_URL}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP=0
DUMP=""
for a in "$@"; do
  case "$a" in
    --keep) KEEP=1 ;;
    *) DUMP="$a" ;;
  esac
done

command -v pg_restore >/dev/null || { echo "pg_restore not found"; exit 1; }
command -v psql >/dev/null || { echo "psql not found"; exit 1; }

if [ -z "$DUMP" ]; then
  DUMP="$(ls -1t "$BACKUP_DIR"/academy_*.dump 2>/dev/null | head -1 || true)"
fi
[ -n "$DUMP" ] && [ -f "$DUMP" ] || { echo "no dump file (arg or $BACKUP_DIR/academy_*.dump)"; exit 1; }

# Split DATABASE_URL into <prefix>/<dbname><?query> to build the scratch URL.
if [[ "$DATABASE_URL" =~ ^(.*://[^/]+)/([^?]+)(\?.*)?$ ]]; then
  PREFIX="${BASH_REMATCH[1]}"; ORIG_DB="${BASH_REMATCH[2]}"; QUERY="${BASH_REMATCH[3]:-}"
else
  echo "could not parse DATABASE_URL"; exit 1
fi
SCRATCH_DB="academy_restore_drill_$(date -u +%Y%m%d_%H%M%S)"
SCRATCH_URL="${PREFIX}/${SCRATCH_DB}${QUERY}"

echo "[drill] dump    : $DUMP"
echo "[drill] server  : ${PREFIX%%\?*}"
echo "[drill] scratch : $SCRATCH_DB (sibling of '$ORIG_DB' — prod is never touched)"

cleanup() {
  if [ "$KEEP" -eq 1 ]; then
    echo "[drill] --keep set; leaving $SCRATCH_DB in place"
  else
    echo "[drill] dropping scratch DB"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$SCRATCH_DB\";" >/dev/null 2>&1 || \
      echo "[drill] WARN: could not drop $SCRATCH_DB — drop it manually"
  fi
}
trap cleanup EXIT

echo "[drill] creating scratch DB"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$SCRATCH_DB\";" >/dev/null

echo "[drill] restoring…"
# --no-owner/--no-privileges: restore under the current role regardless of dump owner.
pg_restore --no-owner --no-privileges --exit-on-error -d "$SCRATCH_URL" "$DUMP"

echo "[drill] verifying key tables:"
FAIL=0
for T in Organization Site Staff Module Certificate Entitlement; do
  N="$(psql "$SCRATCH_URL" -tAc "SELECT count(*) FROM \"$T\";" 2>/dev/null || echo ERR)"
  printf '  %-14s %s\n' "$T" "$N"
  [ "$N" = "ERR" ] && FAIL=1
done

TABLES="$(psql "$SCRATCH_URL" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")"
echo "[drill] public tables restored: $TABLES"
[ "${TABLES:-0}" -gt 0 ] || FAIL=1

if [ "$FAIL" -eq 0 ]; then
  echo "[drill] PASS — dump restores and key tables are readable."
else
  echo "[drill] FAIL — restore incomplete or tables unreadable."; exit 1
fi
