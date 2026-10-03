import { getApps } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let cachedDbId: string | null = null;

export function getFirestoreDatabaseId(): string {
  if (cachedDbId) return cachedDbId;

  if (process.env.FIREBASE_DATABASE_ID) {
    cachedDbId = process.env.FIREBASE_DATABASE_ID;
    return cachedDbId;
  }
  if (process.env.VITE_FIREBASE_DATABASE_ID) {
    cachedDbId = process.env.VITE_FIREBASE_DATABASE_ID;
    return cachedDbId;
  }

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (cfg.firestoreDatabaseId) {
        cachedDbId = cfg.firestoreDatabaseId;
        return cachedDbId;
      }
    }
  } catch {
    // fallback below
  }

  cachedDbId = "ai-studio-grouptravelplann-f077e851-c9d2-483d-be19-1d2a3b70ff44";
  return cachedDbId;
}

let cachedFirestore: Firestore | null = null;

/**
 * Returns a Firestore instance connected to the configured database ID,
 * or null if no admin app is initialized or connection fails.
 */
export function getSafeAdminFirestore(): Firestore | null {
  if (cachedFirestore) return cachedFirestore;
  const apps = getApps();
  if (apps.length === 0) return null;

  try {
    const dbId = getFirestoreDatabaseId();
    cachedFirestore = getFirestore(apps[0], dbId);
    return cachedFirestore;
  } catch {
    return null;
  }
}
