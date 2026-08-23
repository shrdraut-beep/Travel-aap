// server/security/idempotency.ts
// Network Drop & Double-Charge Protection (Payment Idempotency Engine)

export interface IdempotencyRecord {
  key: string;
  userId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  responsePayload?: any;
  httpStatus?: number;
  createdAt: number;
  expiresAt: number;
}

// In-Memory fast lookup cache (LRU / Map)
const memoryIdempotencyStore = new Map<string, IdempotencyRecord>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Periodically purges expired idempotency records from memory
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryIdempotencyStore.entries()) {
    if (record.expiresAt < now) {
      memoryIdempotencyStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export class IdempotencyEngine {
  /**
   * Checks if an idempotency key exists and returns its cached state
   */
  static async checkKey(key: string, userId: string, adminDbInstance?: any): Promise<IdempotencyRecord | null> {
    if (!key) return null;

    const normalizedKey = `${userId || 'anon'}_${key.trim()}`;
    const now = Date.now();

    // 1. Check in-memory store
    const memRecord = memoryIdempotencyStore.get(normalizedKey);
    if (memRecord) {
      if (memRecord.expiresAt > now) {
        return memRecord;
      }
      memoryIdempotencyStore.delete(normalizedKey);
    }

    // 2. Check Firestore if available
    if (adminDbInstance) {
      try {
        const docSnap = await adminDbInstance.collection('idempotency_keys').doc(normalizedKey).get();
        if (docSnap.exists) {
          const data = docSnap.data() as IdempotencyRecord;
          if (data && data.expiresAt > now) {
            memoryIdempotencyStore.set(normalizedKey, data);
            return data;
          }
        }
      } catch {
        // Fall back gracefully to memory store
      }
    }

    return null;
  }

  /**
   * Acquires lock on an idempotency key (status: PROCESSING)
   */
  static async acquireLock(key: string, userId: string, adminDbInstance?: any): Promise<boolean> {
    if (!key) return true;

    const normalizedKey = `${userId || 'anon'}_${key.trim()}`;
    const now = Date.now();
    const existing = await this.checkKey(key, userId, adminDbInstance);

    if (existing) {
      if (existing.status === 'PROCESSING' || existing.status === 'COMPLETED') {
        return false; // Key already locked or completed
      }
    }

    const newRecord: IdempotencyRecord = {
      key: normalizedKey,
      userId: userId || 'anon',
      status: 'PROCESSING',
      createdAt: now,
      expiresAt: now + IDEMPOTENCY_TTL_MS,
    };

    memoryIdempotencyStore.set(normalizedKey, newRecord);

    if (adminDbInstance) {
      try {
        await adminDbInstance.collection('idempotency_keys').doc(normalizedKey).set(newRecord);
      } catch {
        // Fall back to memory store
      }
    }

    return true;
  }

  /**
   * Commits successful response payload to idempotency key
   */
  static async commitResponse(
    key: string,
    userId: string,
    responsePayload: any,
    httpStatus = 200,
    adminDbInstance?: any
  ): Promise<void> {
    if (!key) return;

    const normalizedKey = `${userId || 'anon'}_${key.trim()}`;
    const now = Date.now();

    const record: IdempotencyRecord = {
      key: normalizedKey,
      userId: userId || 'anon',
      status: 'COMPLETED',
      responsePayload,
      httpStatus,
      createdAt: now,
      expiresAt: now + IDEMPOTENCY_TTL_MS,
    };

    memoryIdempotencyStore.set(normalizedKey, record);

    if (adminDbInstance) {
      try {
        await adminDbInstance.collection('idempotency_keys').doc(normalizedKey).set(record);
      } catch {
        // Fall back to memory store
      }
    }
  }

  /**
   * Releases lock or marks failed upon error so user can safely retry
   */
  static async releaseOrFail(key: string, userId: string, adminDbInstance?: any): Promise<void> {
    if (!key) return;

    const normalizedKey = `${userId || 'anon'}_${key.trim()}`;
    memoryIdempotencyStore.delete(normalizedKey);

    if (adminDbInstance) {
      try {
        await adminDbInstance.collection('idempotency_keys').doc(normalizedKey).delete();
      } catch (e) {
        // Non-fatal
      }
    }
  }
}
