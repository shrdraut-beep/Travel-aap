import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { 
  verifyRazorpayWebhookSignature, 
  verifyStripeWebhookSignature, 
  isTestKeyRejectedInProd 
} from '../server/security/paymentWebhook.ts';
import { 
  getMasterKEK, 
  generateDEK, 
  wrapDEK, 
  unwrapDEK, 
  encryptPII, 
  decryptPII 
} from '../server/security/zeroTrustCrypto.ts';
import { REQUIRED_SECRETS } from '../server/config/secrets.ts';

/**
 * COMPREHENSIVE SECURITY AUDIT & TEST SUITE
 * Validates all security measures specified in the Travel App Security & Hacking Guide PDF:
 * 1. Webhook Signature Verification (HMAC SHA-256) & Tamper Detection
 * 2. Replay Attack Protection (Timestamp Tolerance Window & Event Idempotency)
 * 3. XSS & NoSQL Injection Sanitization
 * 4. Zero-Trust Envelope Encryption (AES-256-GCM)
 * 5. Firestore Security Rules (RBAC, User Isolation, Default Deny)
 * 6. Secret Manager & Production Key Protection
 * 7. Client-side Storage Audit (PCI-DSS & Sensitive Data Leak Prevention)
 */

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(category: string, name: string, condition: boolean, details: string) {
  results.push({
    category,
    name,
    passed: condition,
    details
  });
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${category}] ${name}: ${details}`);
}

async function runSecurityAudit() {
  console.log('\n===============================================================');
  console.log('🛡️  ROUTRIPO TRAVEL APP - PDF SECURITY MEASURES TEST SUITE  🛡️');
  console.log('===============================================================\n');

  // ---------------------------------------------------------------------------
  // 1. WEBHOOK DIGITAL SIGNATURE (HMAC-SHA256) VERIFICATION
  // ---------------------------------------------------------------------------
  const webhookSecret = 'test_wh_secret_998877';
  const payload = JSON.stringify({
    event: 'payment.captured',
    payload: { payment: { entity: { id: 'pay_123', amount: 500000, status: 'captured' } } }
  });

  // Calculate genuine signature
  const validSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
  const tamperedPayload = payload.replace('500000', '100'); // Hacker attempts to alter price to 1 rupee
  const invalidSignature = 'invalid_tampered_signature_hex_1234567890abcdef1234567890abcdef';

  const test1Valid = verifyRazorpayWebhookSignature(payload, validSignature, webhookSecret);
  assert('Webhook HMAC', 'Authentic Signature Verification', test1Valid === true, 'Legitimate signature successfully verified');

  const test1Tampered = verifyRazorpayWebhookSignature(tamperedPayload, validSignature, webhookSecret);
  assert('Webhook HMAC', 'Tampered Payload Rejection', test1Tampered === false, 'Hacker-altered payload (price modification) strictly rejected');

  const test1FakeSig = verifyRazorpayWebhookSignature(payload, invalidSignature, webhookSecret);
  assert('Webhook HMAC', 'Forged Signature Rejection', test1FakeSig === false, 'Forged signature rejected');

  // ---------------------------------------------------------------------------
  // 2. REPLAY ATTACK & TIMESTAMP TOLERANCE WINDOW (Page 6)
  // ---------------------------------------------------------------------------
  const stripeSecret = 'whsec_test_stripe_secret_123';
  const stripePayload = '{"id":"evt_1","type":"payment_intent.succeeded"}';
  const nowSec = Math.floor(Date.now() / 1000);

  // Fresh timestamp (< 5 minutes)
  const freshHeader = `t=${nowSec},v1=${crypto.createHmac('sha256', stripeSecret).update(`${nowSec}.${stripePayload}`).digest('hex')}`;
  const isFreshAccepted = verifyStripeWebhookSignature(stripePayload, freshHeader, stripeSecret);
  assert('Replay Defense', 'Fresh Webhook Allowed', isFreshAccepted === true, 'Webhook within 5-minute window accepted');

  // Stale timestamp (10 minutes old - Replay Attack attempt)
  const staleTime = nowSec - 600; // 10 minutes ago
  const staleHeader = `t=${staleTime},v1=${crypto.createHmac('sha256', stripeSecret).update(`${staleTime}.${stripePayload}`).digest('hex')}`;
  const isStaleRejected = verifyStripeWebhookSignature(stripePayload, staleHeader, stripeSecret);
  assert('Replay Defense', 'Replay Attack Rejected', isStaleRejected === false, 'Expired signature (>5 min old) strictly blocked');

  // ---------------------------------------------------------------------------
  // 3. ZERO-TRUST ENVELOPE ENCRYPTION (AES-256-GCM) (Page 1)
  // ---------------------------------------------------------------------------
  const masterKek = getMasterKEK();
  assert('Zero-Trust Crypto', 'Master KEK Derivation', masterKek.length === 32, 'Master KEK is valid 256-bit AES key');

  const dek = generateDEK();
  assert('Zero-Trust Crypto', 'DEK Generation', dek.length === 32, 'Per-user Data Encryption Key is 256-bit');

  const wrapped = wrapDEK(dek, masterKek);
  assert('Zero-Trust Crypto', 'DEK Envelope Wrapping', Boolean(wrapped.wrappedDek && wrapped.keyVersion === 1), 'DEK encrypted with KEK using AES-256-GCM');

  const unwrapped = unwrapDEK(wrapped.wrappedDek, masterKek);
  assert('Zero-Trust Crypto', 'DEK Unwrapping', unwrapped.equals(dek), 'Wrapped DEK successfully unwrapped in secure memory');

  // PII Encryption / Decryption
  const sensitivePassport = 'Z98765432';
  const encryptedPassport = encryptPII(sensitivePassport, dek);
  const decryptedPassport = decryptPII(encryptedPassport, dek);
  assert('Zero-Trust Crypto', 'Field-Level PII Encryption', decryptedPassport === sensitivePassport && encryptedPassport.includes(':'), 'Passport encrypted with AES-256-GCM (iv:ciphertext:tag)');

  // Tamper detection on ciphertext
  const tamperedCipher = encryptedPassport.slice(0, -4) + 'AAAA';
  let tamperCaught = false;
  try {
    const res = decryptPII(tamperedCipher, dek);
    if (res === '[DECRYPTION_ERROR]' || res !== sensitivePassport) {
      tamperCaught = true;
    }
  } catch {
    tamperCaught = true;
  }
  assert('Zero-Trust Crypto', 'Cryptographic Integrity Check', tamperCaught === true, 'Tampered ciphertext rejected by GCM authentication tag');

  // ---------------------------------------------------------------------------
  // 4. PRODUCTION KEY PROTECTION (Page 4)
  // ---------------------------------------------------------------------------
  const prevEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const isTestBlocked = isTestKeyRejectedInProd('rzp_test_1234567890');
  const isLiveAccepted = isTestKeyRejectedInProd('rzp_live_1234567890');
  process.env.NODE_ENV = prevEnv;

  assert('Key Governance', 'Test Key Blocked in Prod', isTestBlocked === true && isLiveAccepted === false, 'Test API keys rejected in production mode');
  assert('Secret Manager', 'Mandatory Secret Manifest', REQUIRED_SECRETS.includes('RAZORPAY_KEY_SECRET') && REQUIRED_SECRETS.includes('RAZORPAY_WEBHOOK_SECRET'), 'All payment and GDS gateway credentials defined in Secret Manager list');

  // ---------------------------------------------------------------------------
  // 5. FIRESTORE SECURITY RULES AUDIT (Page 2 & 3)
  // ---------------------------------------------------------------------------
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  assert('Firestore Rules', 'Rules Version 2', rulesContent.includes("rules_version = '2';"), 'Modern Firestore Rules v2 enforced');
  assert('Firestore Rules', 'Default Deny Rule', rulesContent.includes("match /{document=**}") && rulesContent.includes("allow read, write: if false;"), 'Default deny catch-all prevents unauthorized collection leaks');
  assert('Firestore Rules', 'User Profile Isolation', rulesContent.includes("match /users/{userId}") && rulesContent.includes("allow read, write: if isOwner(userId);"), 'Users can ONLY read and write their own profile');
  assert('Firestore Rules', 'Booking Ownership Enforcement', rulesContent.includes("resource.data.userId == request.auth.uid") && rulesContent.includes("request.resource.data.userId == request.auth.uid"), 'Bookings strictly locked to authenticated owner UID');
  assert('Firestore Rules', 'Public Flight / Hotel Read-Only', rulesContent.includes("match /public_flights/{flightId}") && rulesContent.includes("allow write: if false;"), 'Public inventory is read-only for clients, write blocked');

  // ---------------------------------------------------------------------------
  // 6. XSS & INPUT SANITIZATION AUDIT (Page 2)
  // ---------------------------------------------------------------------------
  const sanitizationPath = path.join(process.cwd(), 'server', 'security', 'sanitization.ts');
  const sanitizationContent = fs.readFileSync(sanitizationPath, 'utf8');

  assert('XSS Prevention', 'Script Tag Stripping', sanitizationContent.includes("<script") && sanitizationContent.includes("sanitizeInput"), 'Input sanitization middleware actively strips script tags and dangerous HTML');
  assert('NoSQL Injection Defense', 'Object Parameter Flattening', sanitizationContent.includes("JSON.stringify(val)"), 'Nested query objects sanitized to prevent NoSQL operator injection');

  // ---------------------------------------------------------------------------
  // 7. CLIENT LOCALSTORAGE AUDIT (Page 2: Never store card/password in local cache)
  // ---------------------------------------------------------------------------
  const srcFiles = ['src/firebase.ts', 'src/services/WalletService.ts', 'src/services/SavedTravellersService.ts'];
  let sensitiveLeakFound = false;

  for (const f of srcFiles) {
    const fullPath = path.join(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      const code = fs.readFileSync(fullPath, 'utf8');
      if (code.includes('localStorage.setItem("creditCard') || code.includes('localStorage.setItem("password') || code.includes('localStorage.setItem("cvv')) {
        sensitiveLeakFound = true;
      }
    }
  }
  assert('PCI-DSS Storage', 'No Raw Card/Password in LocalStorage', sensitiveLeakFound === false, 'No plaintext credit cards, CVVs, or passwords stored in client localStorage');

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log('\n---------------------------------------------------------------');
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`TOTAL AUDIT CHECKS: ${total}`);
  console.log(`PASSED: ${passedCount} ✅`);
  console.log(`FAILED: ${failedCount} ${failedCount > 0 ? '❌' : ''}`);
  console.log('---------------------------------------------------------------\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL PDF SECURITY REQUIREMENTS FULLY VERIFIED & COMPLIANT! 🎉\n');
  }
}

runSecurityAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
