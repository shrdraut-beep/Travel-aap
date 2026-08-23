import { safeStorage } from './utils/storage';
import { safeSession } from './utils/storage';
import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  initializeFirestore,
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  getDocFromServer,
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
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged 
} from "firebase/auth";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken as getAppCheckToken } from "firebase/app-check";
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth, Firestore & Storage
export const auth = getAuth(app);
export function getAuthSafe() {
  return auth;
}

let dbInstance: any;
try {
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = dbInstance;
export const storage = getStorage(app);

// Initialize App Check only if a valid, non-dummy recaptcha key is provided
let appCheckInstance: any = null;
if (typeof window !== "undefined") {
  const envRecaptchaKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
  const configRecaptchaKey = (firebaseConfig as any).recaptchaSiteKey;
  const siteKey = envRecaptchaKey || configRecaptchaKey;

  if (siteKey && typeof siteKey === 'string' && siteKey.trim() !== '' && !siteKey.includes('dummy')) {
    try {
      const isDev = (import.meta as any).env?.DEV;
      if (isDev) {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log("Firebase App Check initialized.");
    } catch (err) {
      console.warn("App Check initialization notice:", err);
    }
  }
}
export const appCheck = appCheckInstance;
export { getAppCheckToken };

// Connection test helper
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Real Google Sign In via Firebase Auth with automatic redirect fallback for popup-blocked environments
 */
export async function signInWithGoogle() {
  const authInstance = getAuthSafe();
  try {
    const result = await signInWithPopup(authInstance, googleProvider);
    return result.user;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-closed-by-user'
    ) {
      console.warn("Google Sign-In popup blocked or closed. Attempting redirect auth fallback:", error?.message);
      try {
        await signInWithRedirect(authInstance, googleProvider);
        return null;
      } catch (redirectErr: any) {
        console.warn("signInWithRedirect fallback notice:", redirectErr?.message || redirectErr);
      }
    }
    console.warn("Google Sign-In notice:", error?.message || error);
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
    const savedLang = localStorage.getItem('routripo_language');
    const savedLangSelected = localStorage.getItem('routripo_language_selected');

    localStorage.removeItem('routripo_user');
    localStorage.removeItem('tripPlanner_activeTripId');
    sessionStorage.clear();

    if (savedLang) localStorage.setItem('routripo_language', savedLang);
    if (savedLangSelected) localStorage.setItem('routripo_language_selected', savedLangSelected);
  }
}

/**
 * Fields that must never be persisted to a trip document. `passcode` used to be stored
 * here, which meant anyone holding a share link could read it and edit the trip; it now
 * lives in `trip_secrets/{tripId}` and is only handled by the backend. Stripping it at
 * this single choke point also migrates legacy documents on their next write.
 */
const TRIP_FIELD_DENYLIST = ['passcode'];

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
    const cleaned = sanitize(data);
    if (cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned)) {
      for (const field of TRIP_FIELD_DENYLIST) delete cleaned[field];
    }
    return cleaned;
  } catch (err) {
    const fallback = JSON.parse(JSON.stringify(data));
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) {
      for (const field of TRIP_FIELD_DENYLIST) delete fallback[field];
    }
    return fallback;
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

/**
 * Persists an FCM registration token so the backend can target this device.
 *
 * Requires a signed-in user: `fcm_tokens` rules only accept a document whose
 * `userId` equals the caller's uid, so an anonymous/'guest' write is always denied.
 * Shared by the web (firebase/messaging) and native (@capacitor/push-notifications)
 * registration paths.
 */
export async function saveFcmToken(
  token: string,
  userId: string | undefined,
  platform: 'web/pwa' | 'android' | 'ios'
): Promise<boolean> {
  if (!userId) {
    console.info('Not saving FCM token: no signed-in user to attribute it to.');
    return false;
  }
  try {
    await setDoc(
      doc(db, 'fcm_tokens', token),
      { token, userId, createdAt: serverTimestamp(), platform },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
}

export async function requestAndSaveFCMToken(userId?: string) {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Messaging is not supported in this environment.');
      return null;
    }
    // VAPID public key from the Firebase Console (Cloud Messaging > Web Push
    // certificates). Without it getToken() cannot produce a usable token, so skip
    // registration rather than calling with a placeholder that always fails.
    const vapidKey = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.info('Push notifications disabled: VITE_FIREBASE_VAPID_KEY is not configured.');
      return null;
    }

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey }).catch(err => {
      console.warn('FCM getToken failed:', err);
      return null;
    });

    if (!token) {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }

    return (await saveFcmToken(token, userId, 'web/pwa')) ? token : null;
  } catch (error) {
    console.error("Error saving token to DB: ", error);
    return null;
  }
}

export { doc, onSnapshot, setDoc, getDoc, updateDoc, deleteDoc };
