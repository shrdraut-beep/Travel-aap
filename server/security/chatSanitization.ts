
import { Request, Response, NextFunction } from 'express';

export interface ChatSanitizeResult {
  allowed: boolean;
  sanitizedText: string;
  violations: string[];
  warning?: string;
}

/**
 * Server-side Multi-Layer Anti-Leakage Sanitization Middleware & Helper
 */
export function sanitizeChatMessage(rawText: string): ChatSanitizeResult {
  if (!rawText || !rawText.trim()) {
    return { allowed: true, sanitizedText: '', violations: [] };
  }

  // Strip HTML
  const cleanInput = rawText.replace(/<[^>]*>?/gm, '').trim();
  const violations: string[] = [];

  // 1. Text Normalization: Strip all spaces, dots, and special characters before checking
  const normalizedText = cleanInput.toLowerCase().replace(/[\s\.\-_,@#$%^&*()]/g, '');

  // 2. Emails & Social Media Handles & URLs (Check against normalized text)
  // Obfuscated checks like "at gmail com", "dot com"
  const socialAndEmailRegex = /(gmail|yahoo|mailme|whatsapp|insta|fb|instagram|telegram|facebook|atgmail|dotcom|atyahoo)/i;
  
  if (socialAndEmailRegex.test(normalizedText)) {
    violations.push('Email/Social Handle/External Domain Link');
  }

  // 3. Continuous & Formatted Numeric Patterns
  const digitsOnly = cleanInput.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 7) {
    violations.push('Numeric Phone Sequence (7+ Digits)');
  }

  // 4. Spelled-Out Numbers (Multilingual: English, Marathi, Hindi)
  // Need to use normalized text without spaces, e.g., "nine8two"
  const spelledEng = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|double|triple|plus)/gi;
  const spelledMar = /(शून्य|एक|दोन|तीन|चार|पाच|सहा|सात|आठ|नऊ|दहा)/g;
  const spelledHin = /(शून्य|एक|दो|तीन|चार|पांच|छह|सात|आठ|नौ|दस)/g;

  if (
    (normalizedText.match(spelledEng) || []).length >= 3 ||
    (cleanInput.match(spelledMar) || []).length >= 3 ||
    (cleanInput.match(spelledHin) || []).length >= 3
  ) {
    violations.push('Spelled-out Multilingual Phone Sequence');
  }

  // 5. Roman Numeral Sequences
  const romanPattern = /\b(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/gi;
  if ((cleanInput.match(romanPattern) || []).length >= 4) {
    violations.push('Roman Numeral Contact Sequence');
  }

  // 6. Contact Trigger Keywords
  const contactTriggers = /(callme|callon|phno|phoneno|mymob|mobileno|contactno|gpay|phonepe|paytmnumber)/i;
  if (contactTriggers.test(normalizedText)) {
    violations.push('Contact Trigger Keywords');
  }

  if (violations.length > 0) {
    return {
      allowed: false,
      sanitizedText: '[REDACTED BY ANTI-LEAKAGE ENGINE]',
      violations,
      warning: 'Platform rules strictly prohibit sharing direct contact details. All communication and payments must go through RouTripO. Repeated violations lead to strike ban.'
    };
  }

  return {
    allowed: true,
    sanitizedText: cleanInput,
    violations: []
  };
}
