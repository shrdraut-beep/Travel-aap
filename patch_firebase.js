const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');
code = code.replace(
  `  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);`,
  `  dbInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    experimentalForceLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);`
);
fs.writeFileSync('src/firebase.ts', code);
