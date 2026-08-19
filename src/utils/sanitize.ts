import DOMPurify from 'dompurify';

/**
 * Sanitizes input text to prevent XSS attacks.
 * Strips out malicious HTML, script tags, etc.
 * 
 * @param text The raw input string
 * @returns The sanitized string
 */
export const sanitizeInput = (text: string | null | undefined): string => {
  if (!text) return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: []  // Strip all HTML attributes
  });
};
