import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { secureLogger } from '../security/logger.ts';

export const REQUIRED_SECRETS = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'TRAVELPORT_CLIENT_ID',
  'TRAVELPORT_CLIENT_SECRET',
  'TRAVELPORT_USERNAME',
  'TRAVELPORT_PASSWORD',
  'ADMIN_MASTER_TOKEN',
  'APP_SECRET',
  'MASTER_KEK',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
  'GROQ_API_KEY',
  'OPENAI_API_KEY',
  'FOURSQUARE_API_KEY',
  'PEXELS_API_KEY',
  'OPENSKY_USERNAME',
  'OPENSKY_PASSWORD',
  'ZOOP_API_KEY',
  'ZOOP_APP_ID',
  'ZUELPAY_API_KEY',
  'ZUELPAY_API_SECRET',
  'SMTP_USER',
  'SMTP_PASS',
  'SENTRY_DSN'
];

export async function loadSecrets(requiredSecrets: string[]) {
  if (process.env.NODE_ENV !== 'production') {
    secureLogger.info('[Secrets] Development environment detected. Skipping Google Secret Manager.');
    return;
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    secureLogger.warn('[Secrets] No GOOGLE_CLOUD_PROJECT defined, skipping Secret Manager.');
    return;
  }

  const client = new SecretManagerServiceClient();

  for (const secretName of requiredSecrets) {
    try {
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();
      
      if (payload) {
        process.env[secretName] = payload;
      } else {
        secureLogger.warn(`[Secrets] Secret ${secretName} fetched but payload was empty.`);
      }
    } catch (error: any) {
      secureLogger.error(`[Secrets] Failed to load secret ${secretName} from Secret Manager:`, error?.message || error);
    }
  }
  secureLogger.info('[Secrets] Successfully loaded secrets from Secret Manager.');
}
