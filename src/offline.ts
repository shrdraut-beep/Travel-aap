import { openDB, IDBPDatabase } from 'idb';
import { TripGroup } from './types';

const DB_NAME = 'pravas_wataghati_offline';
const SYNC_STORE = 'sync_queue';
const TRIPS_STORE = 'trips_store';

export interface SyncItem {
  id: string;
  type: 'expense' | 'deposit' | 'itinerary' | 'trip_update';
  payload: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    collectionName?: string;
    docId?: string;
    data?: any;
  };
  timestamp: number;
}



let dbPromise: Promise<IDBPDatabase> | null = null;

function createDBPromise() {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TRIPS_STORE)) {
        db.createObjectStore(TRIPS_STORE, { keyPath: 'id' });
      }
    },
    blocked() {
      console.warn("IndexedDB blocked");
    },
    blocking() {
      if (dbPromise) {
        dbPromise.then(db => db.close()).catch(() => {});
        dbPromise = null;
      }
    },
    terminated() {
      dbPromise = null;
    },
  });
}

export async function getSyncDB() {
  if (!dbPromise) {
    dbPromise = createDBPromise();
  }
  
  try {
    const db = await dbPromise;
    // Quick check to see if the connection is closed
    db.transaction(SYNC_STORE, 'readonly');
    return db;
  } catch (err) {
    console.warn("IDB connection closed or invalid, recreating...", err);
    try {
      dbPromise = createDBPromise();
      return await dbPromise;
    } catch (e) {
      console.warn("IDB fallback failed, DB unavailable:", e);
      return null;
    }
  }
}



export async function addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp'>) {
  try {
    const db = await getSyncDB();
    if (!db) return null;
    const syncItem: SyncItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    await db.add(SYNC_STORE, syncItem);
    return syncItem.id;
  } catch (err) {
    console.warn("addToSyncQueue error notice:", err);
    return null;
  }
}

export async function getSyncQueue(): Promise<SyncItem[]> {
  try {
    const db = await getSyncDB();
    if (!db) return [];
    return await db.getAll(SYNC_STORE);
  } catch (err) {
    console.warn("getSyncQueue error notice:", err);
    return [];
  }
}

export async function removeFromSyncQueue(id: string) {
  try {
    const db = await getSyncDB();
    if (!db) return;
    await db.delete(SYNC_STORE, id);
  } catch (err) {
    console.warn("removeFromSyncQueue error notice:", err);
  }
}

export async function clearSyncQueue() {
  try {
    const db = await getSyncDB();
    if (!db) return;
    await db.clear(SYNC_STORE);
  } catch (err) {
    console.warn("clearSyncQueue error notice:", err);
  }
}

// Trips DB operations
export async function saveTripOffline(trip: TripGroup) {
  try {
    const db = await getSyncDB();
    if (!db) return;
    await db.put(TRIPS_STORE, trip);
  } catch (err) {
    console.warn("saveTripOffline error notice:", err);
  }
}

export async function getTripsOffline(): Promise<TripGroup[]> {
  try {
    const db = await getSyncDB();
    if (!db) return [];
    return await db.getAll(TRIPS_STORE);
  } catch (err) {
    console.warn("getTripsOffline error notice:", err);
    return [];
  }
}

export async function deleteTripOffline(id: string) {
  try {
    const db = await getSyncDB();
    if (!db) return;
    await db.delete(TRIPS_STORE, id);
  } catch (err) {
    console.warn("deleteTripOffline error notice:", err);
  }
}
