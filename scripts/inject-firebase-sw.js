import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const swPath = path.resolve(process.cwd(), 'public/firebase-messaging-sw.js');
if (!fs.existsSync(swPath)) {
  console.warn(`[Inject-SW] Could not find ${swPath}`);
  process.exit(0);
}

let content = fs.readFileSync(swPath, 'utf8');

const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Replace hardcoded initializeApp block with dynamic config
const initAppRegex = /firebase\.initializeApp\(\{[\s\S]*?\}\);/;
const replacement = `firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});`;

content = content.replace(initAppRegex, replacement);

fs.writeFileSync(swPath, content);
console.log('[Inject-SW] Successfully injected Firebase credentials into service worker.');
