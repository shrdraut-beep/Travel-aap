const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const regex = /let dbInstance: any;.*?export const db = dbInstance;/s;
const replacement = `let dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);\nexport const db = dbInstance;`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/firebase.ts', code);
