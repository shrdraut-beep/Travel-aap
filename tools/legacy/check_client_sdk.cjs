const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

getDocs(collection(db, "checkout_orders"))
  .then(() => console.log("Success with client SDK!"))
  .catch(e => console.error("Error:", e));
