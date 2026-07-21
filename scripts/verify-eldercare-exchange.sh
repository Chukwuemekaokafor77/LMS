#!/usr/bin/env bash
#
# verify-eldercare-exchange.sh — probe ElderCare's /academy/exchange with a
# correctly HMAC-signed request, to investigate the reported 504 and confirm the
# service channel is healthy before go-live (Phase E item 4).
#
# The exchange is Academy→ElderCare, HMAC service auth (the same secret both
# sides share): signature = HMAC-SHA256(ACADEMY_EXCHANGE_SECRET, "<ts>.<body>").
# We send a dummy token, so a HEALTHY endpoint replies 400 "invalid/expired
# token" — that already proves reachability + that the signature was accepted.
#
# Usage:
#   ELDERCARE_API_URL=https://api.eldercare-companion.com \
#   ACADEMY_EXCHANGE_SECRET=<shared secret> \
#     ./scripts/verify-eldercare-exchange.sh
#
set -euo pipefail

BASE="${ELDERCARE_API_URL:-https://api.eldercare-companion.com}"
SECRET="${ACADEMY_EXCHANGE_SECRET:-dummy-secret-not-the-real-one}"
URL="${BASE%/}/api/v1/academy/exchange"

command -v openssl >/dev/null || { echo "openssl required"; exit 1; }
command -v curl >/dev/null || { echo "curl required"; exit 1; }

BODY='{"token":"verify-probe-not-a-real-token"}'
TS="$(date +%s)"
SIG="$(printf '%s' "${TS}.${BODY}" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $NF}')"

echo "[probe] POST $URL"
echo "[probe] signed with ${#SECRET}-char secret (ts=$TS)"

RESP="$(curl -sS -o /tmp/exchange_body.$$ -D /tmp/exchange_hdr.$$ -w '%{http_code} %{time_total}s' \
  -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H "x-academy-timestamp: ${TS}" \
  -H "x-academy-signature: ${SIG}" \
  --max-time 30 \
  --data "$BODY" || true)"
CODE="${RESP%% *}"; TIME="${RESP##* }"
# DigitalOcean's ingress passes the true origin status through this header even
# when Cloudflare rewrites it (a fast 504 masking an app 503, etc.).
ORIG="$(grep -i '^x-do-orig-status:' /tmp/exchange_hdr.$$ 2>/dev/null | awk '{print $2}' | tr -d '\r' || true)"
BODYTEXT="$(head -c 300 /tmp/exchange_body.$$ 2>/dev/null | tr '\n' ' ' || true)"
rm -f /tmp/exchange_body.$$ /tmp/exchange_hdr.$$

echo "[probe] edge HTTP ${CODE:-none}${ORIG:+ (origin ${ORIG})} in ${TIME}"
[ -n "$BODYTEXT" ] && echo "[probe] body: ${BODYTEXT:0:120}"
echo

# Diagnose on the ORIGIN status when present (the edge code can be a masked 504).
EFF="${ORIG:-$CODE}"
case "$EFF" in
  400) echo "✅ HEALTHY — reachable, HMAC accepted (secret matches). 400 = dummy token rejected, as expected. Ready for a real handoff." ;;
  401) echo "🔑 Reachable, but the signature was rejected — the ACADEMY_EXCHANGE_SECRET here does NOT match ElderCare's. Align the shared secret (SECRETS_ROTATION_RUNBOOK.md) and re-run." ;;
  503) echo "⚙️  Origin 503 'Academy is not configured' — ACADEMY_EXCHANGE_SECRET is UNSET on the ElderCare app (the handler 503s before it even checks your signature). This is the usual cause of the Cloudflare-masked 504. Set ACADEMY_EXCHANGE_SECRET on ElderCare, redeploy, re-run." ;;
  504) echo "⏱️  Genuine gateway timeout (no origin status) — the app/Redis/DB is actually hanging, or the proxy timeout is too low. Check ElderCare app + Redis health." ;;
  000|none|"") echo "🌐 No response — DNS/network/TLS." ;;
  *)   echo "❓ Unexpected ${EFF} — inspect the body/headers and the ElderCare logs." ;;
esac
