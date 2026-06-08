#!/usr/bin/env bash
# Create the Maple Care S3 bucket in ca-central-1 with PHIPAA-grade defaults:
#   - SSE-KMS encryption (aws/s3 by default; pass MAPLE_KMS_KEY_ID for CMK)
#   - all public access blocked
#   - versioning on
#   - lifecycle: transition non-current versions to Glacier after 90d, expire roster-imports after 180d
#   - bucket policy denies non-TLS access
#
# Idempotent — safe to re-run. Reads $AWS_S3_BUCKET from the environment or .env.
#
# Requires: aws CLI v2 with credentials configured.

set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

REGION="${AWS_REGION:-ca-central-1}"
BUCKET="${AWS_S3_BUCKET:?Set AWS_S3_BUCKET (e.g. maple-care-prod-ca-central-1)}"
KMS_KEY_ID="${MAPLE_KMS_KEY_ID:-aws/s3}"

if [ "$REGION" != "ca-central-1" ]; then
  echo "Refusing: AWS_REGION=$REGION (must be ca-central-1 for PHIPAA residency)"
  exit 1
fi

echo "→ Bucket   : $BUCKET"
echo "→ Region   : $REGION"
echo "→ KMS key  : $KMS_KEY_ID"

if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "✓ Bucket already exists"
else
  echo "→ Creating bucket"
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration "LocationConstraint=$REGION"
fi

echo "→ Block all public access"
aws s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration \
  '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":true,"RestrictPublicBuckets":true}'

echo "→ Enable versioning"
aws s3api put-bucket-versioning --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

echo "→ Enable SSE-KMS"
aws s3api put-bucket-encryption --bucket "$BUCKET" --server-side-encryption-configuration "$(cat <<JSON
{
  "Rules": [{
    "ApplyServerSideEncryptionByDefault": {
      "SSEAlgorithm": "aws:kms",
      "KMSMasterKeyID": "$KMS_KEY_ID"
    },
    "BucketKeyEnabled": true
  }]
}
JSON
)"

echo "→ Apply lifecycle rules"
aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET" --lifecycle-configuration "$(cat <<'JSON'
{
  "Rules": [
    {
      "ID": "transition-noncurrent-to-glacier",
      "Status": "Enabled",
      "Filter": {},
      "NoncurrentVersionTransitions": [
        { "NoncurrentDays": 90, "StorageClass": "GLACIER" }
      ],
      "NoncurrentVersionExpiration": { "NoncurrentDays": 730 }
    },
    {
      "ID": "expire-roster-imports",
      "Status": "Enabled",
      "Filter": { "Prefix": "roster-imports/" },
      "Expiration": { "Days": 180 }
    },
    {
      "ID": "abort-incomplete-multipart",
      "Status": "Enabled",
      "Filter": {},
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 }
    }
  ]
}
JSON
)"

echo "→ Apply bucket policy: deny non-TLS"
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "$(cat <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyInsecureTransport",
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": [
      "arn:aws:s3:::$BUCKET",
      "arn:aws:s3:::$BUCKET/*"
    ],
    "Condition": { "Bool": { "aws:SecureTransport": "false" } }
  }]
}
JSON
)"

echo "✓ Done. AWS_S3_BUCKET=$BUCKET in $REGION"
