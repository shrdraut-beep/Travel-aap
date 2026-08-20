const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.use\(helmet\(\{[\s\S]*?contentSecurityPolicy: false,[\s\S]*?\}\)\);/;

const replacement = `app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://*", "wss://*", "http://localhost:*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://*.firebaseapp.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.firebaseapp.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*"],
      frameSrc: ["'self'", "https://checkout.razorpay.com", "https://*.firebaseapp.com", "https://*.firebase.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));`;

code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
