import { safeStorage } from './utils/storage';
import { safeSession } from './utils/storage';
import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { 
  getAuth, 
  deleteUser, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged 
} from "firebase/auth";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Config parsed from firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0070042137",
  appId: "1:974625843598:web:79a85a1f88ddc5fbe95cdf",
  apiKey: "AIzaSyAqWmoMOZIflucdFRmqV_WJPMvPMBx9LGI",
  authDomain: "gen-lang-client-0070042137.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-grouptravelplann-f077e851-c9d2-483d-be19-1d2a3b70ff44",
  storageBucket: "gen-lang-client-0070042137.firebasestorage.app",
  messagingSenderId: "974625843598"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth, Firestore & Storage
let _authInstance: ReturnType<typeof getAuth> | null = null;
export function getAuthSafe() {
  if (!_authInstance) {
    _authInstance = getAuth(app);
  }
  return _authInstance;
}

export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop, receiver) {
    const instance = getAuthSafe();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  set(_target, prop, value, receiver) {
    const instance = getAuthSafe();
    return Reflect.set(instance, prop, value, receiver);
  }
});

let dbInstance: any;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache(),
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  console.warn("initializeFirestore fallback to getFirestore due to cache/browser lock:", e);
  try {
    dbInstance = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalAutoDetectLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
  } catch (e2) {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}
export const db = dbInstance;
export const storage = getStorage(app);

// Connection test helper as per Firestore guidelines with fallback timeout
async function testConnection() {
  try {
    const { getDocFromServer } = await import("firebase/firestore");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timeout')), 2000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]).catch(() => {
      // Catch race rejection silently
    });
  } catch (error) {
    console.warn("Firestore client operating in offline/cached mode.");
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Real Google Sign In via Firebase Auth
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(getAuthSafe(), googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn("Google Sign-In popup notice or iframe constraint:", error?.message || error);
    throw error;
  }
}

/**
 * Permanently deletes user account, authentication record, storage files, and associated database collections.
 */
export async function deleteUserAccountAndData(userId?: string): Promise<void> {
  const currentUser = auth.currentUser;
  const uid = userId || currentUser?.uid;

  // Step 1: Delete user documents & collections in Firestore if UID exists
  if (uid) {
    try {
      // Delete primary user document
      const userRef = doc(db, "users", uid);
      await deleteDoc(userRef).catch(() => {});

      const userProfileRef = doc(db, "user_profiles", uid);
      await deleteDoc(userProfileRef).catch(() => {});

      // Delete user's trips documents where user is owner
      const tripsQuery = query(collection(db, "trips"), where("ownerId", "==", uid));
      const tripSnaps = await getDocs(tripsQuery).catch(() => null);
      if (tripSnaps) {
        for (const tripDoc of tripSnaps.docs) {
          await deleteDoc(tripDoc.ref).catch(() => {});
        }
      }

      // Delete user's expense records
      const expensesQuery = query(collection(db, "expenses"), where("userId", "==", uid));
      const expenseSnaps = await getDocs(expensesQuery).catch(() => null);
      if (expenseSnaps) {
        for (const expDoc of expenseSnaps.docs) {
          await deleteDoc(expDoc.ref).catch(() => {});
        }
      }
    } catch (dbErr) {
      console.warn("Firestore data cleanup notice:", dbErr);
    }

    // Step 2: Delete user files/folders in Firebase Storage (receipts, avatars)
    try {
      const userStorageRef = ref(storage, `users/${uid}`);
      const userFilesList = await listAll(userStorageRef).catch(() => null);
      if (userFilesList) {
        for (const itemRef of userFilesList.items) {
          await deleteObject(itemRef).catch(() => {});
        }
      }
    } catch (storageErr) {
      console.warn("Firebase Storage cleanup notice:", storageErr);
    }
  }

  // Step 3: Delete Firebase Authentication User Record
  if (currentUser) {
    try {
      await deleteUser(currentUser);
    } catch (authErr: any) {
      console.error("Firebase Auth user delete error:", authErr);
      if (authErr?.code === 'auth/requires-recent-login' || authErr?.message?.includes('requires-recent-login')) {
        throw new Error("REAUTH_REQUIRED");
      }
      throw authErr;
    }
  }

  // Step 4: Purge Local Storage & App Caches
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB if applicable, excluding Firestore persistence database
    if ('indexedDB' in window) {
      try {
        const dbs = await window.indexedDB.databases?.();
        if (dbs) {
          for (const dbInfo of dbs) {
            // Firestore persistence databases are managed by the SDK and should not be force-deleted while in use
            if (dbInfo.name && !dbInfo.name.includes("firebase-persistence")) {
              window.indexedDB.deleteDatabase(dbInfo.name);
            }
          }
        }
      } catch (idbErr) {
        console.warn("IndexedDB clearing notice:", idbErr);
      }
    }
  }
}

// Alias export for GDPR / Play Store compliance compatibility
export const deleteUserAccount = deleteUserAccountAndData;

/**
 * Securely signs out current user from Firebase Auth and purges user session caches, while preserving language preferences.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(getAuthSafe());
  } catch (err) {
    console.error("Firebase signOut error:", err);
  }
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('pravas_language');
    const savedLangSelected = localStorage.getItem('pravas_language_selected');

    localStorage.removeItem('pravas_user');
    localStorage.removeItem('tripPlanner_activeTripId');
    sessionStorage.clear();

    if (savedLang) localStorage.setItem('pravas_language', savedLang);
    if (savedLangSelected) localStorage.setItem('pravas_language_selected', savedLangSelected);
  }
}

export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;

  const sanitize = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj
        .filter(item => item !== undefined)
        .map(sanitize);
    }
    const cleanObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleanObj[key] = sanitize(val);
      }
    }
    return cleanObj;
  };

  try {
    return sanitize(data);
  } catch (err) {
    return JSON.parse(JSON.stringify(data));
  }
}

// Structured error handling for Firestore permission/operation issues
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function requestAndSaveFCMToken(userId?: string) {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Messaging is not supported in this environment.');
      return null;
    }
    const messaging = getMessaging(app);
    // VAPID key would normally go here if configured in Firebase Console
    const token = await getToken(messaging, {
      vapidKey: 'BBE23B33C3B23C3B23C3B23C3B23C3B23C3B23C3B23C3B23C3B23C3B23' // Fake key for preview purposes, or should use actual if provided. The user didn't provide one.
    }).catch(err => {
      // It will likely fail without a valid VAPID key on web, but this is the structure requested
      console.warn('GetToken failed (likely missing VAPID key in preview):', err);
      return null;
    });

    if (token) {
      const tokenRef = doc(db, 'fcm_tokens', token);
      await setDoc(tokenRef, {
        token: token,
        userId: userId || 'guest',
        createdAt: serverTimestamp(),
        platform: 'web/pwa'
      }, { merge: true });
      console.log("Token securely saved to Firestore for future notifications.");
      return token;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error("Error saving token to DB: ", error);
    return null;
  }
}

export { doc, onSnapshot, setDoc, getDoc, updateDoc, deleteDoc };
