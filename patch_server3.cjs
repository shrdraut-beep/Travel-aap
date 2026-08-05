const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = 'const response = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(location + " tourism travel")}&per_page=6`, {';
const replaceStr = 'const response = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(location + " nature landscape")}&per_page=6`, {';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts successfully");
} else {
  console.log("Target string not found in server.ts");
}
