'use strict';

const morgan = require('morgan');

morgan.token('path-only', (req) => req.path || '/');

const SENSITIVE_PATHS = ['/api/v1/resumes', '/api/v1/users'];
morgan.token('safe-url', (req) => {
  const path = req.path || '/';
  const isSensitive = SENSITIVE_PATHS.some((p) => path.startsWith(p));

  if (isSensitive) return path;

  const qs =
    req.query && Object.keys(req.query).length > 0 ? `?[${Object.keys(req.query).join(',')}]` : '';
  return `${path}${qs}`;
});

const format = '[:date[iso]] :method :safe-url :status :response-time ms';

const requestLogger = morgan(format, {

  skip: () => process.env.NODE_ENV === 'test',
  stream: {
    write: (message) => {

      process.stdout.write(message.trimEnd() + '\n');
    },
  },
});

module.exports = requestLogger;