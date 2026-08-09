'use strict';

const errorHandler = (err, _req, res, _next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || null;
  let details = err.details || null;

  if (err.name === 'MulterError') {
    statusCode = 422;
    code = `UPLOAD_${err.code}`; 
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File exceeds the maximum allowed size.`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Only one file may be uploaded at a time.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected field "${err.field}". Use the field name "file".`;
        break;
      default:
        message = `File upload error: ${err.message}`;
    }
  }

  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'A record with that value already exists';
    code = 'CONFLICT';
    details = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    message = 'Operation violates a data integrity constraint';
    code = 'INTEGRITY_CONSTRAINT';
  }

  if (message.startsWith('CORS:')) {
    statusCode = 403;
    code = 'CORS_REJECTED';
  }

  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body too large';
    code = 'PAYLOAD_TOO_LARGE';
  }
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
    code = 'BAD_JSON';
  }

  if (statusCode >= 500) {
    console.error('[Error]', err); 
  }

  const error = { message };
  if (code) error.code = code;
  if (details) error.details = details;
  if (isDev && statusCode >= 500) error.stack = err.stack;

  return res.status(statusCode).json({ success: false, error });
};

module.exports = errorHandler;