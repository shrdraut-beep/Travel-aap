const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ 1\. HTTP Security \(Helmet\)[\s\S]*?\}\)\);\n/g;

const smartHelmetConfig = `// 1. HTTP Security (Helmet)
// Smart Configuration: Automatically relaxes security for AI Studio iframe previews during development,
// but enforces strict security when deployed in production (NODE_ENV=production).
const isProduction = process.env.NODE_ENV === 'production';
const allowIframe = process.env.ALLOW_IFRAME_EMBED === 'true' || !isProduction;

app.use(helmet({
  // If allowIframe is true, disable CSP to allow embedding in AI Studio. 
  // Otherwise, use Helmet's strict default CSP for production security.
  contentSecurityPolicy: allowIframe ? false : undefined, 
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
`;

code = code.replace(regex, smartHelmetConfig);
fs.writeFileSync('server.ts', code);
