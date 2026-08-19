/**
 * DLP / LOG SANITIZATION MODULE (Zero-Trust Cryptographic Hygiene)
 * 
 * Intercepts and sanitizes all server log output to prevent PII leakage to GCP Cloud Logging.
 * Redacts phone numbers, passport numbers, email addresses, payment tokens, card numbers, and secret keys.
 */

const REDACTED_PLACEHOLDER = "[REDACTED]";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "adminsecrettoken",
  "admin_secret_token",
  "authorization",
  "phone",
  "phonenumber",
  "mobile",
  "contact",
  "email",
  "passport",
  "passportnumber",
  "aadhaar",
  "aadhaarnumber",
  "pan",
  "pannumber",
  "cardnumber",
  "card_number",
  "cvv",
  "cvc",
  "accountnumber",
  "account_number",
  "bankaccount",
  "dek",
  "kek",
  "wrappeddek"
]);

/**
 * Deeply sanitizes any log object/array/value before outputting
 */
export function sanitizeLogValue(val: any): any {
  if (val === null || val === undefined) return val;

  if (typeof val === "string") {
    // Redact email patterns in plain strings
    let sanitized = val.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]");
    // Redact 10-digit phone numbers in plain strings
    sanitized = sanitized.replace(/\b(?:\+91|0)?[6-9]\d{9}\b/g, "[PHONE_REDACTED]");
    // Redact 16-digit card patterns
    sanitized = sanitized.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, "[CARD_REDACTED]");
    return sanitized;
  }

  if (typeof val === "number" || typeof val === "boolean") {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map(item => sanitizeLogValue(item));
  }

  if (typeof val === "object") {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, "");
      if (SENSITIVE_KEYS.has(lowerKey)) {
        cleaned[key] = REDACTED_PLACEHOLDER;
      } else {
        cleaned[key] = sanitizeLogValue(val[key]);
      }
    }
    return cleaned;
  }

  return val;
}

/**
 * Secure Logger with DLP Redaction
 */
export const secureLogger = {
  info: (message: string, ...meta: any[]) => {
    const sanitizedMeta = meta.map(m => sanitizeLogValue(m));
    console.log(`[INFO] [${new Date().toISOString()}] ${sanitizeLogValue(message)}`, ...sanitizedMeta);
  },
  warn: (message: string, ...meta: any[]) => {
    const sanitizedMeta = meta.map(m => sanitizeLogValue(m));
    console.warn(`[WARN] [${new Date().toISOString()}] ${sanitizeLogValue(message)}`, ...sanitizedMeta);
  },
  error: (message: string, ...meta: any[]) => {
    const sanitizedMeta = meta.map(m => sanitizeLogValue(m));
    console.error(`[ERROR] [${new Date().toISOString()}] ${sanitizeLogValue(message)}`, ...sanitizedMeta);
  },
  audit: (action: string, details: Record<string, any>) => {
    const sanitizedDetails = sanitizeLogValue(details);
    console.log(`[AUDIT_LOG] [${new Date().toISOString()}] Action: ${action}`, JSON.stringify(sanitizedDetails));
  }
};
