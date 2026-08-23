const fs = require('fs');
let content = fs.readFileSync('src/utils/razorpay.ts', 'utf8');

content = content.replace(
  /const order = await response\.json\(\);/,
  `const order = await response.json();\n  if (!response.ok) {\n    return onFailure(order.details || order.error || "Failed to create order");\n  }`
);

fs.writeFileSync('src/utils/razorpay.ts', content);
