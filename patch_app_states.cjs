const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const [isAIGenerating, setIsSmartGenerating] = useState(false);`;
const replaceStr = `  const [isAIGenerating, setIsSmartGenerating] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<any[]>([]);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched states in src/App.tsx");
} else {
  console.log("Could not find target string in src/App.tsx");
}
