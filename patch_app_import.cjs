const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `import { PreTripPlanner } from './components/PreTripPlanner';`;
const replaceStr = `import { PreTripPlanner } from './components/PreTripPlanner';
import { SmartPlanLoadingOverlay } from './components/SmartPlanLoadingOverlay';`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched import in src/App.tsx");
} else {
  console.log("Could not find target string for import in src/App.tsx");
}
