import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

let firebaseConfig: any = {};
firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));

const app = initializeApp({
  credential: applicationDefault(),
  projectId: firebaseConfig.projectId
});

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
async function run() {
  try {
    const snap = await db.collection("agent_ads").limit(1).get();
    console.log("Success! size:", snap.size);
  } catch(e: any) {
    console.error("Error:", e.message);
  }
}
run();
