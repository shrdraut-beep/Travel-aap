const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore(app);

db.collection("test").limit(1).get()
  .then(() => console.log("Success with default DB!"))
  .catch(e => console.error("Error:", e.message));
