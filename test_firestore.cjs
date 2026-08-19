const { Firestore } = require('@google-cloud/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const db = new Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId
});

db.collection('test').limit(1).get()
  .then(() => console.log('SUCCESS'))
  .catch(e => console.error('ERROR:', e.message));
