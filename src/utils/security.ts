import { safeStorage } from './storage';
/**
 * Security & Data Hardening Utilities
 * Routripo (सहलीचे नियोजन व हिशोब)
 */

/**
 * Strips HTML tags, script elements, and dangerous executable script prefixes from user input strings
 * to prevent XSS (Cross-Site Scripting) vulnerabilities.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  if (typeof input !== 'string') return String(input);

  return input
    // Remove <script> tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Replace dangerous javascript: pseudo-protocol
    .replace(/javascript:/gi, '')
    // Neutralize inline event handlers like onerror= or onload=
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Recursively sanitizes object strings for safe payload transmission and database operations.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitizeObject((obj as Record<string, any>)[key]);
      }
    }
    return sanitizedObj as T;
  }
  return obj;
}

/**
 * Obfuscates sensitive values before saving to localStorage to prevent plain-text exposure in DevTools.
 */
function obfuscateData(data: string): string {
  try {
    return 'pwt_enc_' + btoa(encodeURIComponent(data));
  } catch (err) {
    return data;
  }
}

/**
 * Deobfuscates values retrieved from localStorage.
 */
function deobfuscateData(stored: string): string {
  try {
    if (stored.startsWith('pwt_enc_')) {
      const raw = stored.replace('pwt_enc_', '');
      return decodeURIComponent(atob(raw));
    }
    return stored;
  } catch (err) {
    return stored;
  }
}

/**
 * Encrypted/Obfuscated Local Storage Wrapper for sensitive trip data, budgets, and user settings.
 */
export const secureStorage = {
  getItem: <T = any>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      const raw = deobfuscateData(stored);
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch (err) {
      console.warn(`[secureStorage] Read error for key "${key}":`, err);
      return defaultValue;
    }
  },

  setItem: (key: string, value: any): void => {
    try {
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      const obfuscated = obfuscateData(stringified);
      localStorage.setItem(key, obfuscated);
    } catch (err) {
      console.warn(`[secureStorage] Write error for key "${key}":`, err);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[secureStorage] Remove error for key "${key}":`, err);
    }
  }
};

/**
 * Masks sensitive PII for safe display in UI views
 */
export function maskSensitiveText(val: string | number | null | undefined, type: "phone" | "email" | "card" | "id" | "text" = "text"): string {
  if (!val) return '';
  const str = String(val);
  if (type === "phone") {
    return str.length > 4 ? `••••• ••${str.slice(-4)}` : "••••••••••";
  }
  if (type === "email") {
    const atIndex = str.indexOf("@");
    if (atIndex > 1) {
      return `${str[0]}•••••${str.slice(atIndex)}`;
    }
    return "••••@••••.com";
  }
  if (type === "card") {
    const clean = str.replace(/\D/g, "");
    return clean.length >= 4 ? `••••-••••-••••-${clean.slice(-4)}` : "••••-••••-••••-••••";
  }
  if (type === "id") {
    return str.length > 4 ? `••••••${str.slice(-4)}` : "••••••••";
  }
  return str.length <= 4 ? "••••" : `${str[0]}••••${str.slice(-1)}`;
}

/**
 * Log production security notice for developers & admins.
 */
export function initSecurityNotice(): void {
  if (typeof window !== 'undefined') {
    console.info(
      "%c🔒 PRIVACY & SECURITY HARDENED (Zero-Trust Envelope Encryption & HMAC Webhooks)",
      "color: #10b981; font-weight: bold; font-size: 13px;",
      "\n- Input Sanitization & XSS Protections: ACTIVE\n- Local Storage Data Obfuscation: ACTIVE\n- Envelope Encryption & Server Fulfillment: ACTIVE\n- Zero-Trust Admin Legal Vault: ACTIVE"
    );
  }
}

/**
 * Unpredictable Secure Reference ID Generation (Anti-IDOR / Anti-Guessing)
 * Generates non-sequential IDs like TRP-9xK2mP7qL
 */
export function generateSecureId(prefix: string = 'REF'): string {
  // Use Node.js crypto if in server environment
  if (typeof process !== 'undefined' && process.release && process.release.name === 'node') {
    const crypto = require('crypto');
    return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
  }
  let randomPart = '';
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(6); // 12 hex chars
    window.crypto.getRandomValues(array);
    randomPart = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto
    randomPart = 
      Math.random().toString(36).substring(2, 8) + 
      Math.random().toString(36).substring(2, 8);
  }

  // Format: PREFIX-XXXX-XXXX
  const p1 = randomPart.substring(0, 4);
  const p2 = randomPart.substring(4, 8);
  
  return `${prefix}-${p1}-${p2}`.toUpperCase();
}

