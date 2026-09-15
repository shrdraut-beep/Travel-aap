#!/usr/bin/env bash
#
# scripts/backup-firestore.sh
#
# Automated Firestore export to Cloud Storage, for disaster recovery.
#
# RTO/RPO this gives you (tune the cron schedule below to match your real targets):
#   - Daily full export  -> RPO of up to 24h, RTO ~1-2h (restore = new import job)
#   - Hourly export of high-value collections (bookings, payment_records, checkout_orders)
#     -> RPO of up to 1h for the data that actually costs money if lost
#
# SETUP (one-time):
#   1. Create a dedicated backup bucket (versioning + lifecycle to control storage cost):
#        gsutil mb -l asia-southeast1 gs://YOUR_PROJECT-firestore-backups
#        gsutil versioning set on gs://YOUR_PROJECT-firestore-backups
#        gsutil lifecycle set lifecycle.json gs://YOUR_PROJECT-firestore-backups
#      (lifecycle.json example further down in this file's comments)
#
#   2. Grant the Cloud Scheduler / Cloud Run service account export permission:
#        gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
#          --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
#          --role="roles/datastore.importExportAdmin"
#
#   3. Schedule via Cloud Scheduler (recommended over cron-in-container, survives redeploys):
#        gcloud scheduler jobs create http firestore-daily-backup \
#          --schedule="0 2 * * *" \
#          --uri="https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default):exportDocuments" \
#          --http-method=POST \
#          --oauth-service-account-email=YOUR_SERVICE_ACCOUNT \
#          --message-body='{"outputUriPrefix":"gs://YOUR_PROJECT-firestore-backups/daily"}'
#
#      And a second job for the hourly high-value-collection export:
#        gcloud scheduler jobs create http firestore-hourly-critical-backup \
#          --schedule="0 * * * *" \
#          --uri="https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default):exportDocuments" \
#          --http-method=POST \
#          --oauth-service-account-email=YOUR_SERVICE_ACCOUNT \
#          --message-body='{"outputUriPrefix":"gs://YOUR_PROJECT-firestore-backups/hourly-critical","collectionIds":["bookings","payment_records","checkout_orders","webhook_events"]}'
#
# This script is for MANUAL/ad-hoc runs and local testing of the same export call —
# Cloud Scheduler above is what should run in production, not this script on a timer.

set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:?Set GOOGLE_CLOUD_PROJECT}"
BUCKET="gs://${PROJECT_ID}-firestore-backups"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")

MODE="${1:-full}"  # full | critical

if [ "$MODE" = "critical" ]; then
  echo "Exporting critical collections only (bookings, payment_records, checkout_orders, webhook_events)..."
  gcloud firestore export "${BUCKET}/manual-critical-${TIMESTAMP}" \
    --collection-ids='bookings,payment_records,checkout_orders,webhook_events' \
    --project="${PROJECT_ID}"
else
  echo "Exporting full Firestore database..."
  gcloud firestore export "${BUCKET}/manual-full-${TIMESTAMP}" \
    --project="${PROJECT_ID}"
fi

echo "Backup started. Check status with:"
echo "  gcloud firestore operations list --project=${PROJECT_ID}"

# --- lifecycle.json reference (paste into a separate file, not part of this script) ---
# {
#   "rule": [
#     { "action": {"type": "Delete"}, "condition": {"age": 90} },
#     { "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"}, "condition": {"age": 30} }
#   ]
# }
# Keeps 90 days of backups, moves anything older than 30 days to cheaper Coldline storage.
