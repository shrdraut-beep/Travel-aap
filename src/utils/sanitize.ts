import DOMPurify from 'dompurify';
import { SanitizationResult } from '../types';

/**
 * Sanitizes input text to prevent XSS attacks.
 * Strips out malicious HTML, script tags, etc.
 */
export const sanitizeInput = (text: string | null | undefined): string => {
  if (!text) return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

/**
 * Multi-Layer Leakage Filter Engine
 * Intercepts, masks, or blocks contact details (phone, email, social handles, spelled numbers).
 */
export function checkChatAntiLeakage(rawText: string): SanitizationResult {
  if (!rawText || !rawText.trim()) {
    return {
      isSanitized: true,
      sanitizedText: '',
      violationsDetected: [],
      action: 'ALLOW'
    };
  }

  const cleanInput = sanitizeInput(rawText);
  const violations: string[] = [];

  // 1. Email & Social Handle Regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const socialRegex = /(insta|instagram|fb|facebook|telegram|wa|whatsapp|connect me at|gmail|yahoo|outlook|mail me)\s*[:\-@]/gi;
  const domainPattern = /[a-zA-Z0-9\-]+\.(com|in|org|net|co|io|me|ai)\b/gi;

  if (emailRegex.test(cleanInput) || socialRegex.test(cleanInput) || domainPattern.test(cleanInput)) {
    violations.push('Direct Email or Social Media Handle Detected');
  }

  // 2. Numeric Sequences (Phone numbers with spaces, dots, dashes, commas, brackets)
  // Strips non-digits except letters to analyze formatted phone numbers
  const digitsOnly = cleanInput.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 7) {
    violations.push('Numeric Contact / Phone Number Sequence Detected');
  }

  const formattedPhoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)[\d\s.-]{6,12}/g;
  if (formattedPhoneRegex.test(cleanInput)) {
    violations.push('Formatted Phone Number Detected');
  }

  // 3. Spelled-Out Numbers (English, Marathi, Hindi)
  const spelledEnglish = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|double|triple|plus)\b/gi;
  const spelledMarathi = /\b(शून्य|एक|दोन|तीन|चार|पाच|सहा|सात|आठ|नऊ|दहा)\b/g;
  const spelledHindi = /\b(शून्य|एक|दो|तीन|चार|पांच|छह|सात|आठ|नौ|दस)\b/g;

  const englishMatches = (cleanInput.match(spelledEnglish) || []).length;
  const marathiMatches = (cleanInput.match(spelledMarathi) || []).length;
  const hindiMatches = (cleanInput.match(spelledHindi) || []).length;

  if (englishMatches >= 3 || marathiMatches >= 3 || hindiMatches >= 3) {
    violations.push('Spelled-out Phone Number Detected (Multilingual)');
  }

  // 4. Roman Numerals in sequence (e.g. IX VIII VII VI...)
  const romanPattern = /\b(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/gi;
  const romanMatches = (cleanInput.match(romanPattern) || []).length;
  if (romanMatches >= 4) {
    violations.push('Roman Numeral Contact Sequence Detected');
  }

  // 5. Explicit Call / Contact Trigger Words
  const contactTriggers = /(call me|call on|ph no|phone no|my mob|mobile no|contact no|gpay|phonepe|paytm number)/gi;
  if (contactTriggers.test(cleanInput)) {
    violations.push('Direct Contact Demand Keyword Detected');
  }

  if (violations.length > 0) {
    return {
      isSanitized: false,
      sanitizedText: '[BLOCKED BY ANTI-LEAKAGE ENGINE]',
      violationsDetected: violations,
      action: 'BLOCK',
      warningMessage: 'Platform rules strictly prohibit sharing direct contact details. All deals must be conducted via RouTripO Escrow. Repeated attempts will lead to account termination.'
    };
  }

  return {
    isSanitized: true,
    sanitizedText: cleanInput,
    violationsDetected: [],
    action: 'ALLOW'
  };
}
