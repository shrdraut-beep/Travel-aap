const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importStatement = `import helmet from "helmet";\n`;
if (!code.includes(importStatement)) {
    code = code.replace(/import cors from "cors";/, `import cors from "cors";\n${importStatement}`);
}

const helmetConfig = `
// 1. HTTP Security (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
`;

if (!code.includes('app.use(helmet({')) {
    code = code.replace(/\/\/ 2\. CORS Configuration/, `${helmetConfig}\n// 2. CORS Configuration`);
}

fs.writeFileSync('server.ts', code);
