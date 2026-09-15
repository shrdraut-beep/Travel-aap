# Disaster Recovery Runbook — RoutTripo (Firestore)

## Targets

| Data class | RPO (max data loss) | RTO (max time to restore) |
|---|---|---|
| Bookings, payments, webhook events | 1 hour (hourly critical export) | 2 hours |
| Everything else (packages, hotels catalog, user_consent, etc.) | 24 hours (daily full export) | 4 hours |

If these don't match your actual business tolerance, change the Cloud Scheduler cron
expressions in `backup-firestore.sh`'s setup comments — hourly-critical can go to every
15 minutes if you need a tighter RPO for payments.

## Restore procedure

1. **Identify the export to restore from:**
   ```bash
   gsutil ls gs://YOUR_PROJECT-firestore-backups/hourly-critical/
   gsutil ls gs://YOUR_PROJECT-firestore-backups/daily/
   ```
   Pick the most recent export before the incident.

2. **Restore to a NEW database first, never directly into production:**
   ```bash
   gcloud firestore databases create --database=restore-drill --location=asia-southeast1
   gcloud firestore import gs://YOUR_PROJECT-firestore-backups/daily/EXPORT_ID \
     --database=restore-drill
   ```

3. **Verify data integrity** in `restore-drill` — spot-check a few recent bookings,
   confirm `payment_records` and `checkout_orders` counts look sane, check no partial-write
   corruption from the moment of the incident.

4. **Only after verification**, either:
   - Point the app at `restore-drill` via `FIRESTORE_DATABASE_ID` env var (fastest — no
     data movement, matches how `adminDb()` already takes a database ID in `server.ts`), or
   - Import into `(default)` if you need to keep the original database ID (slower, requires
     the corrupted data to be cleared first).

5. **Post-incident:** replay any webhook events from the payment gateway's dashboard
   (Razorpay/Stripe both let you resend webhooks for a date range) to fill the gap between
   the last backup and the incident — this is why `webhook_events` has replay-protection
   (`db.runTransaction` + event ID dedup) already built into `paymentWebhook.ts`, so resending
   is safe and won't double-process.

## Run a restore drill quarterly

A backup you've never restored from is unverified. Put a recurring calendar reminder to:
1. Run the restore procedure above into `restore-drill`.
2. Time how long it actually takes — compare against the RTO targets.
3. Delete `restore-drill` after (`gcloud firestore databases delete --database=restore-drill`).
