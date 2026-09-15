/**
 * server/config/secrets.ts
 *
 * Loads runtime secrets from Google Secret Manager in production.
 * In development, falls back to process.env (populated by dotenv from .env)
 * so local dev workflow is unchanged.
 *
 * SETUP:
 *   npm install @google-cloud/secret-manager
 *
 *   For each secret currently in .env, create it once in Secret Manager:
 *     gcloud secrets create RAZORPAY_KEY_SECRET --replication-policy="automatic"
 *     printf "your-actual-secret" | gcloud secrets versions add RAZORPAY_KEY_SECRET --data-file=-
 *
 *   Grant the Cloud Run service account access:
 *     gcloud secrets add-iam-policy-binding RAZORPAY_KEY_SECRET \
 *       --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
 *       --role="roles/secretmanager.secretAccessor"
 *
 * USAGE (in server.ts, before any code reads process.env.* for secrets):
 *   import { loadSecrets } from "./server/config/secrets.ts";
 *   await loadSecrets(["RAZORPAY_KEY_ID","RAZORPAY_KEY_SECRET","RAZORPAY_WEBHOOK_SECRET", ...]);
 *   // after this call, process.env.RAZORPAY_KEY_SECRET etc. are populated exactly as before —
 *   // no other code needs to change.
 */

import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const isProduction = process.env.NODE_ENV === "production";
const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;

let client: SecretManagerServiceClient | null = null;

function getClient(): SecretManagerServiceClient {
  if (!client) client = new SecretManagerServiceClient();
  return client;
}

/**
 * Fetches each named secret's latest version from Secret Manager and injects it
 * into process.env, unless it's already set (lets you override per-instance if needed).
 * In non-production, this is a no-op — dotenv-loaded .env values are used as-is.
 */
export async function loadSecrets(secretNames: string[]): Promise<void> {
  if (!isProduction) {
    return; // dev/test: keep using .env via dotenv, unchanged
  }

  if (!projectId) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT is not set — required to load secrets from Secret Manager in production."
    );
  }

  const sm = getClient();

  await Promise.all(
    secretNames.map(async (name) => {
      if (process.env[name]) return; // already provided (e.g. injected by the platform)

      const secretPath = `projects/${projectId}/secrets/${name}/versions/latest`;
      try {
        const [version] = await sm.accessSecretVersion({ name: secretPath });
        const value = version.payload?.data?.toString();
        if (value) {
          process.env[name] = value;
        } else {
          console.error(`[secrets] Secret ${name} exists but has no payload.`);
        }
      } catch (err) {
        // Fail loud, not silent — a missing prod secret should stop the boot,
        // not surface later as a confusing 500 mid-checkout.
        console.error(`[secrets] Failed to load secret ${name}:`, err);
        throw err;
      }
    })
  );
}

/**
 * The full list of secret names RoutTripo currently keeps in .env.
 * Keep this in sync with .env.example.
 */
export const REQUIRED_SECRETS = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "TRAVELPORT_CLIENT_ID",
  "TRAVELPORT_CLIENT_SECRET",
  "SMTP_USER",
  "SMTP_PASS",
  "FIREBASE_ADMIN_PRIVATE_KEY",
  // add remaining names from your current .env here
];
