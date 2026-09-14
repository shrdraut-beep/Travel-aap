# Disaster Recovery (DR) Runbook

This document outlines the standard procedures for responding to critical failures within the RoutTripo application infrastructure.

## 1. Database Failure or Corruption (Firestore)

**Symptom**: Data corruption, accidental mass deletion, or complete data loss.

**Action Plan**:
1. Check Cloud Logging for recent anomalies indicating how the data was lost (e.g., erroneous script).
2. Stop the traffic or scale down instances to prevent further corruption.
3. Access the latest backup from the Firestore backup GCS bucket (`gs://[PROJECT_ID]-firestore-backups`).
4. Run the restore command:
   ```bash
   gcloud firestore import gs://[PROJECT_ID]-firestore-backups/[TIMESTAMP]
   ```
5. Verify data integrity in the staging environment before fully routing production traffic back.

## 2. API Key / Secret Compromise

**Symptom**: Unauthorized usage alerts on Razorpay, Travelport, or GCP resources, or detection via GitHub secret scanning.

**Action Plan**:
1. Immediately **revoke** the compromised key in the respective provider's dashboard (Razorpay Dashboard, Travelport Portal, etc.).
2. Generate a new set of keys.
3. Update the keys securely in Google Cloud Secret Manager.
   ```bash
   echo -n "NEW_SECRET_VALUE" | gcloud secrets versions add [SECRET_NAME] --data-file=-
   ```
4. Restart the Cloud Run instances to ensure the lazy-loader (`loadSecrets()`) fetches the latest version of the secrets.
   ```bash
   gcloud run services update [SERVICE_NAME] --update-env-vars RESTART_TRIGGER=$(date +%s)
   ```

## 3. High Traffic DDoS or Spike

**Symptom**: 503 Errors, high latency, alerts from Sentry indicating prefill queue overload or timeout.

**Action Plan**:
1. Open Google Cloud Armor dashboard.
2. Enable strict rate limiting (e.g., max 100 requests per IP per minute).
3. If specific abusive IPs are identified, block them manually in Cloud Armor.
4. Scale up maximum Cloud Run instances if the traffic is legitimate.
