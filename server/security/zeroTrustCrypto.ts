import crypto from "crypto";
import { Firestore, FieldValue } from "firebase-admin/firestore";

/**
 * ZERO-TRUST ENVELOPE ENCRYPTION & KEY MANAGEMENT MODULE
 * 
 * Architecture:
 * - Master Key (KEK - Key Encryption Key): Stored securely in Secret Manager / Server Environment (AES-256).
 * - Data Encryption Key (DEK): A unique 256-bit cryptographic key generated per user/partner.
 * - Envelope Encryption: DEK is encrypted using the KEK (wrapped DEK) and persisted in Firestore `user_keys/{userId}`.
 * - Auto-Recovery: When a user authenticates, their wrapped DEK is fetched and unwrapped into backend memory.
 * - Field-Level Encryption (FLE): Sensitive PII (fullName, phone, passport, aadhaar, etc.) is encrypted via AES-256-GCM.
 *   Ciphertext format: `iv:ciphertext:authTag` (Base64).
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Derives a valid 32-byte (256-bit) KEK buffer from the environment or default deterministic fallback
 */
export function getMasterKEK(): Buffer {
  const rawKey = process.env.MASTER_KEK || process.env.ENCRYPTION_MASTER_KEY;
  if (!rawKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: MASTER_KEK is not configured in production environment.");
    }
    // Deterministic fallback for dev sandboxes (32 bytes derived via SHA-256)
    return crypto.createHash("sha256").update("dev-master-kek-routripo-zero-trust-salt-2026").digest();
  }

  // If provided as hex or base64 or raw string:
  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, "hex");
  }
  if (rawKey.length === 44 && /^[A-Za-z0-9+/=]+$/.test(rawKey)) {
    return Buffer.from(rawKey, "base64");
  }
  return crypto.createHash("sha256").update(rawKey).digest();
}

/**
 * Generates a brand new cryptographically random 256-bit Data Encryption Key (DEK)
 */
export function generateDEK(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Wraps (encrypts) a Data Encryption Key (DEK) using the Master Key (KEK) with AES-256-GCM
 */
export function wrapDEK(dek: Buffer, kek: Buffer = getMasterKEK()): { wrappedDek: string; keyVersion: number } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, kek, iv);
  
  const encrypted = Buffer.concat([cipher.update(dek), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine iv:encryptedDek:authTag
  const payload = Buffer.concat([iv, authTag, encrypted]);
  return {
    wrappedDek: payload.toString("base64"),
    keyVersion: 1
  };
}

/**
 * Unwraps (decrypts) a wrapped Data Encryption Key (DEK) using the Master Key (KEK)
 */
export function unwrapDEK(wrappedDekBase64: string, kek: Buffer = getMasterKEK()): Buffer {
  const buffer = Buffer.from(wrappedDekBase64, "base64");
  
  if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Invalid wrapped DEK payload structure");
  }

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, kek, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * In-memory cache for unwrapped DEKs during active backend requests to avoid continuous DB round-trips
 */
const dekMemoryCache = new Map<string, { dek: Buffer; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches or automatically provisions and unwraps the user's DEK from Firestore
 */
export async function getOrCreateUserDEK(userId: string, db: Firestore | null): Promise<Buffer> {
  if (!userId) throw new Error("User ID is required for DEK retrieval");

  // 1. Check in-memory cache
  const cached = dekMemoryCache.get(userId);
  if (cached && cached.expiry > Date.now()) {
    return cached.dek;
  }

  if (!db) {
    // If DB is offline in test mode, return a deterministic user key
    return crypto.createHash("sha256").update(`offline-user-dek-${userId}`).digest();
  }

  const keyDocRef = db.collection("user_keys").doc(userId);
  const doc = await keyDocRef.get();

  let dek: Buffer;

  if (doc.exists && doc.data()?.wrappedDek) {
    const wrappedDek = doc.data()?.wrappedDek;
    dek = unwrapDEK(wrappedDek);
  } else {
    // Provision a new DEK for this user and store wrapped version
    dek = generateDEK();
    const { wrappedDek, keyVersion } = wrapDEK(dek);

    await keyDocRef.set({
      userId,
      wrappedDek,
      keyVersion,
      algorithm: ALGORITHM,
      createdAt: FieldValue.serverTimestamp(),
      lastRotatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  }

  // Save to memory cache
  dekMemoryCache.set(userId, { dek, expiry: Date.now() + CACHE_TTL_MS });
  return dek;
}

/**
 * Encrypts sensitive PII string using AES-256-GCM with a user-specific DEK
 * Output format: `iv:ciphertext:authTag` (all base64)
 */
export function encryptPII(plaintext: string | null | undefined, dek: Buffer): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);

  const encrypted = Buffer.concat([cipher.update(Buffer.from(plaintext, "utf8")), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${encrypted.toString("base64")}:${authTag.toString("base64")}`;
}

/**
 * Decrypts sensitive PII string formatted as `iv:ciphertext:authTag` using user DEK
 */
export function decryptPII(ciphertextWithTag: string | null | undefined, dek: Buffer): string {
  if (!ciphertextWithTag) return "";
  
  // If not encrypted (legacy or plain string), return as is safely
  if (!ciphertextWithTag.includes(":")) {
    return ciphertextWithTag;
  }

  const parts = ciphertextWithTag.split(":");
  if (parts.length !== 3) {
    return ciphertextWithTag;
  }

  try {
    const iv = Buffer.from(parts[0], "base64");
    const ciphertext = Buffer.from(parts[1], "base64");
    const authTag = Buffer.from(parts[2], "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.warn("[decryptPII] Decryption failed, may be corrupted or wrong key:", err);
    return "[DECRYPTION_ERROR]";
  }
}

/**
 * PII Field Lists commonly used across user profiles, partner KYC, and booking manifests
 */
export const PII_FIELDS = [
  "fullName",
  "name",
  "proprietorName",
  "agencyName",
  "phone",
  "phoneNumber",
  "mobile",
  "email",
  "passport",
  "passportNumber",
  "aadhaar",
  "aadhaarNumber",
  "panNumber",
  "panVat",
  "bankAccount",
  "accountNumber",
  "ifsc",
  "ifscCode",
  "emergencyContact",
  "address"
];

/**
 * Encrypts PII properties of an object in-place before persisting to Firestore
 */
export function encryptObjectPII<T extends Record<string, any>>(obj: T, dek: Buffer, customPiiFields: string[] = PII_FIELDS): T {
  if (!obj || typeof obj !== "object") return obj;
  const result: any = Array.isArray(obj) ? [] : { ...obj };

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object") {
      result[key] = encryptObjectPII(val, dek, customPiiFields);
    } else if (typeof val === "string" && customPiiFields.includes(key)) {
      result[key] = encryptPII(val, dek);
    } else {
      result[key] = val;
    }
  }

  return result;
}

/**
 * Decrypts PII properties of an object retrieved from Firestore before sending to authorized frontend
 */
export function decryptObjectPII<T extends Record<string, any>>(obj: T, dek: Buffer, customPiiFields: string[] = PII_FIELDS): T {
  if (!obj || typeof obj !== "object") return obj;
  const result: any = Array.isArray(obj) ? [] : { ...obj };

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object") {
      result[key] = decryptObjectPII(val, dek, customPiiFields);
    } else if (typeof val === "string" && customPiiFields.includes(key)) {
      result[key] = decryptPII(val, dek);
    } else {
      result[key] = val;
    }
  }

  return result;
}

/**
 * Module 4: Key Rotation Engine
 * Fetches all user DEKs from Firestore, decrypts with old KEK, re-encrypts with new KEK, and updates Firestore.
 */
export async function rotateAllUserDEKs(
  db: Firestore,
  oldKek: Buffer,
  newKek: Buffer
): Promise<{ rotatedCount: number; errors: string[] }> {
  const snapshot = await db.collection("user_keys").get();
  let rotatedCount = 0;
  const errors: string[] = [];

  const batchSize = 400;
  let batch = db.batch();
  let countInBatch = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.wrappedDek) continue;

    try {
      // 1. Unwrap DEK using old KEK
      const rawDek = unwrapDEK(data.wrappedDek, oldKek);
      // 2. Re-wrap DEK using new KEK
      const { wrappedDek } = wrapDEK(rawDek, newKek);

      // 3. Update doc in batch
      batch.update(doc.ref, {
        wrappedDek,
        keyVersion: (data.keyVersion || 1) + 1,
        lastRotatedAt: FieldValue.serverTimestamp()
      });

      countInBatch++;
      rotatedCount++;

      if (countInBatch >= batchSize) {
        await batch.commit();
        batch = db.batch();
        countInBatch = 0;
      }
    } catch (err: any) {
      errors.push(`Failed to rotate key for user ${doc.id}: ${err.message}`);
    }
  }

  if (countInBatch > 0) {
    await batch.commit();
  }

  // Clear memory cache so all subsequent requests use newly wrapped keys
  dekMemoryCache.clear();

  return { rotatedCount, errors };
}
