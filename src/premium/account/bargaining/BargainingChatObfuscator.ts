import React from 'react';

/**
 * Military-Grade Regex Obfuscator for Bargaining Module Chat
 * 
 * Aggressively intercepts and redacts:
 * 1. Emails: standard, dot/at spelled out, brackets, parentheses, spaces.
 * 2. Phone numbers: 10-digits contiguous or spaced, dots, dashes, country codes.
 * 3. Spelled-out numbers in English, Marathi, and Hindi.
 * 4. Alphanumeric mixes (e.g., "9eight7six...").
 * 5. Devanagari numerals.
 * 
 * Replaces all violations with "[CONTACT INFO BLOCKED]" rendered in red.
 */

export const BLOCKED_TAG = '[CONTACT INFO BLOCKED]';

// 1. Spelled-out word maps
const ENGLISH_NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'double', 'triple'
];

const MARATHI_NUMBER_WORDS = [
  'शून्य', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा'
];

const HINDI_NUMBER_WORDS = [
  'शून्य', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस'
];

// Combine all number words for multilingual alternation
const ALL_NUMBER_WORDS = [
  ...ENGLISH_NUMBER_WORDS,
  ...MARATHI_NUMBER_WORDS,
  ...HINDI_NUMBER_WORDS
];

export interface ObfuscationResult {
  sanitizedText: string;
  hasViolations: boolean;
  violationsCount: number;
}

/**
 * Aggressive regex sanitizer that substitutes phone/email leakage with [CONTACT INFO BLOCKED].
 */
export function obfuscateBargainChatText(rawText: string): ObfuscationResult {
  if (!rawText || !rawText.trim()) {
    return { sanitizedText: rawText || '', hasViolations: false, violationsCount: 0 };
  }

  let text = rawText;
  let hasViolations = false;
  let violationsCount = 0;

  const markViolation = () => {
    hasViolations = true;
    violationsCount++;
  };

  // --- A. EMAIL PATTERNS ---
  // Standard email: user@domain.com
  const standardEmailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  if (standardEmailRegex.test(text)) {
    markViolation();
    text = text.replace(standardEmailRegex, BLOCKED_TAG);
  }

  // Obfuscated email with dot/at words & brackets:
  // e.g. "sharad dot raut at gmail dot com", "sharad(dot)raut[at]gmail(dot)com", "sharad [at] yahoo dot com"
  const obfuscatedEmailRegex = /[A-Za-z0-9._%+-]+(?:\s*[\(\[\{<\/\\]*(?:dot|\.)[\)\]\}>\/\\]*\s*[A-Za-z0-9._%+-]+)*\s*[\(\[\{<\/\\]*(?:at|@|\[at\]|\(at\))[\)\]\}>\/\\]*\s*[A-Za-z0-9.-]+\s*[\(\[\{<\/\\]*(?:dot|\.)[\)\]\}>\/\\]*\s*(?:com|in|co\.in|org|net|io|me|ai|live|gov|edu)\b/gi;
  if (obfuscatedEmailRegex.test(text)) {
    markViolation();
    text = text.replace(obfuscatedEmailRegex, BLOCKED_TAG);
  }

  // Loose email domains mentioned in context (e.g. "my mail is sharad at gmail")
  const looseEmailRegex = /\b[A-Za-z0-9._%+-]+\s*(?:@|\bat\b)\s*(?:gmail|yahoo|outlook|hotmail|rediff|icloud|proton|zoho)\b(?:\s*(?:\.|\bdot\b)\s*(?:com|in|co|org))?/gi;
  if (looseEmailRegex.test(text)) {
    markViolation();
    text = text.replace(looseEmailRegex, BLOCKED_TAG);
  }

  // --- B. PHONE NUMBER PATTERNS ---
  // 1. Formatted phone with country code or standard 10-12 digits (+91 98765 43210, +91-9876543210)
  const formattedPhoneRegex = /(\+?91[\s-]?)?[6-9]\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g;
  if (formattedPhoneRegex.test(text)) {
    markViolation();
    text = text.replace(formattedPhoneRegex, BLOCKED_TAG);
  }

  // 2. Spaced or dotted digits: "9 8 7 6 5 4 3 2 1 0", "9.8.7.6.5.4.3.2.1.0", "9-8-7-6..."
  // Matches 7 or more digits separated by single spaces, dots, dashes, or commas
  const spacedDigitsRegex = /(?:\b\d[\s.,_-]){6,}\d\b/g;
  if (spacedDigitsRegex.test(text)) {
    markViolation();
    text = text.replace(spacedDigitsRegex, BLOCKED_TAG);
  }

  // 3. Devanagari numerals sequence: "९८७६५४३२१०" or spaced "९ ८ ७ ६..."
  const devanagariPhoneRegex = /[०-९\s.,-]{7,}/g;
  if (devanagariPhoneRegex.test(text)) {
    markViolation();
    text = text.replace(devanagariPhoneRegex, BLOCKED_TAG);
  }

  // 4. Spelled-out numbers sequence (English, Marathi, Hindi)
  // Non-ASCII Devanagari characters require punctuation/whitespace boundary checks
  const wordsPattern = ALL_NUMBER_WORDS.join('|');
  const spelledSequenceRegex = new RegExp(
    `(?:^|[\\s.,;!?()[\\]{}])(?:${wordsPattern})(?:[\\s,.-]+(?:${wordsPattern})){3,}(?=[\\s.,;!?()[\\]{}]|$)`,
    'gi'
  );
  if (spelledSequenceRegex.test(text)) {
    markViolation();
    text = text.replace(spelledSequenceRegex, (m) => {
      const leadingSpace = m.match(/^\s/);
      return (leadingSpace ? leadingSpace[0] : '') + BLOCKED_TAG;
    });
  }

  // 5. Alphanumeric mixes (e.g., "9eight7six5four3two1zero", "9 eight 7 six...")
  const tokens = text.split(/[\s,;!?]+/);
  for (const token of tokens) {
    if (token.length >= 8) {
      let count = (token.match(/\d/g) || []).length;
      const lowerToken = token.toLowerCase();
      for (const w of ALL_NUMBER_WORDS) {
        if (w.length >= 3 && lowerToken.includes(w)) {
          count++;
        }
      }
      if (count >= 5) {
        markViolation();
        text = text.replace(token, BLOCKED_TAG);
      }
    }
  }

  // 6. Any isolated 10-digit number
  const tenDigitRegex = /\b\d{10}\b/g;
  if (tenDigitRegex.test(text)) {
    markViolation();
    text = text.replace(tenDigitRegex, BLOCKED_TAG);
  }

  return {
    sanitizedText: text,
    hasViolations,
    violationsCount
  };
}

/**
 * Helper to render message text with any [CONTACT INFO BLOCKED] badge in red.
 */
export function renderObfuscatedMessageContent(content: string): React.ReactNode {
  if (!content) return null;

  if (!content.includes(BLOCKED_TAG)) {
    return content;
  }

  const parts = content.split(BLOCKED_TAG);
  const elements: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) elements.push(part);
    if (index < parts.length - 1) {
      elements.push(
        React.createElement(
          'span',
          {
            key: `blocked-${index}`,
            className:
              'inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-300 select-none shadow-xs'
          },
          React.createElement('span', { className: 'text-xs' }, '[Blocked]'),
          ' [CONTACT INFO BLOCKED]'
        )
      );
    }
  });

  return React.createElement(React.Fragment, null, ...elements);
}
