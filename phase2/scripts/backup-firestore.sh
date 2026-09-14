#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-ai-studio-grouptravelplann-f077e851-c9d2-483d-be19-1d2a3b70ff44}"
BACKUP_BUCKET="${FIRESTORE_BACKUP_BUCKET:-gs://${PROJECT_ID}-firestore-backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_BUCKET}/${TIMESTAMP}"

echo "Starting Firestore backup for project: $PROJECT_ID"
echo "Destination: $BACKUP_PATH"

# Ensure the bucket exists (optional, could assume it exists via Terraform)
# gsutil mb -p $PROJECT_ID $BACKUP_BUCKET || true

# Trigger export
gcloud firestore export "$BACKUP_PATH" \
  --project="$PROJECT_ID" \
  --async

echo "Backup job initiated asynchronously!"
echo "Check status via: gcloud firestore operations list --project=$PROJECT_ID"
