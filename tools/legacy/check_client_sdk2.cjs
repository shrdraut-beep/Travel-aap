const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

setDoc(doc(db, "checkout_orders", "test_id"), { test: 1 })
  .then(() => { console.log("Success with client SDK!"); process.exit(0); })
  .catch(e => { console.error("Error:", e.message); process.exit(1); });
