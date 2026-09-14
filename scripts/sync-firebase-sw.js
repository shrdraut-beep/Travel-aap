import fs from 'fs';
import path from 'path';

/**
 * Syncs Firebase credentials from firebase-applet-config.json into public/firebase-messaging-sw.js
 * Prevents split-brain database and project mismatch issues in service worker.
 */
function syncFirebaseServiceWorker() {
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, 'firebase-applet-config.json');
  const swPath = path.join(rootDir, 'public', 'firebase-messaging-sw.js');

  if (!fs.existsSync(configPath)) {
    console.warn('[sync-firebase-sw] firebase-applet-config.json not found, skipping sync.');
    return;
  }

  if (!fs.existsSync(swPath)) {
    console.warn('[sync-firebase-sw] public/firebase-messaging-sw.js not found, skipping sync.');
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    let swContent = fs.readFileSync(swPath, 'utf8');

    // Replace initializeApp config block
    const newConfigBlock = `firebase.initializeApp({
  projectId: '${config.projectId || ""}',
  appId: '${config.appId || ""}',
  apiKey: '${config.apiKey || ""}',
  authDomain: '${config.authDomain || ""}',
  storageBucket: '${config.storageBucket || ""}',
  messagingSenderId: '${config.messagingSenderId || ""}',
});`;

    const regex = /firebase\.initializeApp\(\{[\s\S]*?\}\);/;
    if (regex.test(swContent)) {
      swContent = swContent.replace(regex, newConfigBlock);
      fs.writeFileSync(swPath, swContent, 'utf8');
      console.log('✅ [sync-firebase-sw] Successfully synchronized Firebase config to public/firebase-messaging-sw.js');
    } else {
      console.warn('[sync-firebase-sw] initializeApp pattern not found in service worker.');
    }
  } catch (err) {
    console.error('[sync-firebase-sw] Failed to synchronize service worker config:', err);
  }
}

syncFirebaseServiceWorker();
