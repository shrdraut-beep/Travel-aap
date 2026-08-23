const fs = require('fs');

let content = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// Add import
if (!content.includes('DebugErrorAlert')) {
  content = content.replace(/import \{ (exportElementToPdf) \} from '\.\.\/utils\/exportUtils';/, "import { $1 } from '../utils/exportUtils';\nimport { DebugErrorAlert } from '../components/ui/DebugErrorAlert';");
}

// Add checkoutError state
content = content.replace(
  /const \[couponError, setCouponError\] = useState<string \| null>\(null\);/,
  'const [couponError, setCouponError] = useState<string | null>(null);\n  const [checkoutError, setCheckoutError] = useState<string | null>(null);'
);

// Add to handleProceedToPayment catch blocks and clear it at the beginning
content = content.replace(
  /setIsProcessing\(true\);/,
  'setIsProcessing(true);\n    setCheckoutError(null);'
);

// We need to look for `onFailure` or catch block of `initiateRazorpayPayment`
content = content.replace(
  /onFailure: \(\(err\) => \{([\s\S]*?)\}\)/,
  'onFailure: ((err) => {\n              console.error("Razorpay error", err);\n              setCheckoutError(err?.message || String(err));\n              setIsProcessing(false);\n              setProcessingTicket(false);\n              alert("Payment failed or cancelled");\n            })'
);

// Replace generic error in the main catch block of handleProceedToPayment
content = content.replace(
  /\} catch \(error\) \{[\s\S]*?setIsProcessing\(false\);[\s\S]*?setProcessingTicket\(false\);[\s\S]*?alert\("Payment initialization failed"\);[\s\S]*?\}/,
  '} catch (error: any) {\n      console.error(error);\n      setCheckoutError(error?.message || String(error));\n      setIsProcessing(false);\n      setProcessingTicket(false);\n    }'
);

// Add DebugErrorAlert above the submit button
content = content.replace(
  /\{\/\* 6\. Proceed to Pay Button \*\/\}/,
  '{checkoutError && <DebugErrorAlert error={checkoutError} />}\n\n                {/* 6. Proceed to Pay Button */}'
);

fs.writeFileSync('src/pages/CheckoutPage.tsx', content);
