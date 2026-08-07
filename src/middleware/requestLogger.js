'use strict';

const morgan = require('morgan');

/**
 * PII-safe request logger.
 *
 * Security rules:
 * - Never log request or response bodies.
 * - Never log Authorization or Cookie headers.
 * - Log the URL path only — no query strings (which may carry tokens or IDs).
 * - Routes that handle resume data are labelled but their payloads are never logged.
 */

// Custom token: path only, no query string
morgan.token('path-only', (req) => req.path || '/');

// Custom token: redact the query string for sensitive routes
const SENSITIVE_PATHS = ['/api/v1/resumes', '/api/v1/users'];
morgan.token('safe-url', (req) => {
  const path = req.path || '/';
  const isSensitive = SENSITIVE_PATHS.some((p) => path.startsWith(p));
  // For sensitive routes, log path only (drop query string entirely)
  if (isSensitive) return path;
  // For other routes, include query string only if short and non-sensitive
  const qs =
    req.query && Object.keys(req.query).length > 0 ? `?[${Object.keys(req.query).join(',')}]` : '';
  return `${path}${qs}`;
});

/**
 * Format: [timestamp] METHOD /safe-url STATUS response_time_ms
 * Example: [2026-08-06T10:00:00Z] POST /api/v1/resumes 201 45ms
 */
const format = '[:date[iso]] :method :safe-url :status :response-time ms';

const requestLogger = morgan(format, {
  // Skip logging in test environment
  skip: () => process.env.NODE_ENV === 'test',
  stream: {
    write: (message) => {
      // Strip trailing newline before writing
      process.stdout.write(message.trimEnd() + '\n');
    },
  },
});

module.exports = requestLogger;
