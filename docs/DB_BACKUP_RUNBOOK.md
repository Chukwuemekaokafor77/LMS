# Database Backup & Restore Drill (Phase E item 3)

Two layers of backup for the Academy Postgres:

1. **Provider automatic backups** — DO Managed Postgres takes daily physical
   backups with point-in-time recovery, retained per plan. This is the primary
   recovery path (DO dashboard → Databases → cluster → **Backups / Restore**).
2. **Logical dumps** ([scripts/db-backup.sh](../scripts/db-backup.sh)) — portable
   `pg_dump` custom-format files you can move **off-provider** (S3/Spaces, or
   local) and restore anywhere. This is the DR path if the DO account/cluster is
   ever the thing that's lost, and the source for the restore drill.

Both are needed: provider backups are convenient but locked to DO; logical dumps
are provider-independent but coarser (no PITR).

## Take a backup

```bash
DATABASE_URL='postgres://user:pass@host:5432/db' \
  BACKUP_DIR=./backups RETENTION_DAYS=14 \
  S3_DEST=s3://academy-backups-prod/pg \
  ./scripts/db-backup.sh
```

- `-Fc` custom format (compressed, supports selective restore); `--no-owner
  --no-privileges` so it restores under any role.
- Records size + SHA-256 to `backups/SHA256SUMS`.
- With `S3_DEST` set, uploads off-provider (`aws s3 cp`; add `AWS_ENDPOINT_URL_S3`
  for DO Spaces). Prunes local dumps older than `RETENTION_DAYS`.

**Schedule it:** on DO, the cleanest home is a scheduled **Job** component (or the
existing worker) running the script daily/weekly; or a cron on any Canadian host
with `DATABASE_URL` + `aws` configured. Keep the off-provider copy in a Canadian
region (Spaces TOR1 / S3 ca-central-1) to preserve residency.

## Restore drill (prove it works — quarterly + after schema changes)

```bash
DATABASE_URL='postgres://user:pass@host:5432/db' \
  ./scripts/db-restore-drill.sh            # newest ./backups dump
# or: ./scripts/db-restore-drill.sh path/to/academy_YYYYMMDD.dump --keep
```

The drill restores into a uniquely-named **scratch sibling DB**
(`academy_restore_drill_*`), verifies the schema + key tables
(`Organization/Site/Staff/Module/Certificate/Entitlement`) are readable, prints
row counts, and drops the scratch DB (`--keep` to retain). The production
database is only ever read for its name — never written or dropped.

Exit 0 + `PASS` = the backup is restorable. Non-zero + `FAIL` = investigate
before you rely on it.

> **Verified 2026-07-21** against the dev database: the exact
> dump → create-scratch → `pg_restore` → count-key-tables → drop sequence these
> scripts run completed clean (20 tables restored, all key tables incl. the new
> `Entitlement` readable). Host `pg_dump`/`pg_restore`/`psql` (postgresql-client
> 16, matching the server major) are the only prerequisites.

## Restoring for real

- **Corruption / bad migration, cluster intact:** prefer DO's provider restore
  (PITR to just before the incident).
- **Provider/account loss:** provision a new Postgres (TOR1), then
  `pg_restore --no-owner --no-privileges -d "$NEW_DATABASE_URL" <dump>` from the
  latest off-provider dump, point `academy-api`'s `DATABASE_URL` at it, redeploy.
- After any restore, run the [GO_LIVE_VERIFICATION.md](GO_LIVE_VERIFICATION.md)
  smoke checks before taking traffic.
