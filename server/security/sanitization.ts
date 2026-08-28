import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import express from 'express';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const sanitizeString = (str: string): string => {
  return purify.sanitize(str);
};

const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return sanitizeString(input);
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        // Prevent NoSQL injection by ensuring we don't allow deep object nesting
        // if we expect a string field. For now, we strip objects if they appear 
        // where a simple value is expected, but this is a rough heuristic.
        // The most robust way is to use Zod schemas (which this app already does!)
        // for each endpoint. This middleware is a safety net.
        const val = input[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            // If it's an object, it might be a NoSQL operator.
            // For a safety net, we flatten it or treat it as a stringified version.
            sanitized[key] = JSON.stringify(val);
        } else {
            sanitized[key] = sanitizeInput(val);
        }
      }
    }
    return sanitized;
  }
  return input;
};

export const sanitizeMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};
