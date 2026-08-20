const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  credential: applicationDefault(),
  projectId: "gen-lang-client-0070042137",
});
console.log("App projectId:", app.options.projectId);
const db = getFirestore(app, "ai-studio-grouptravelplann-f077e851-c9d2-483d-be19-1d2a3b70ff44");

db.collection("checkout_orders").limit(1).get()
  .then(() => console.log("Success!"))
  .catch(e => console.error("Error:", e.message));
