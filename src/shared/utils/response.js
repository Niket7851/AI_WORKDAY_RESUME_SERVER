'use strict';

const sendSuccess = (res, data, statusCode = 200, meta = null) => {
  const body = { success: true, data };
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendError = (res, message, statusCode = 500, code = null, details = null) => {
  const error = { message };
  if (code) error.code = code;
  if (details && details.length > 0) error.details = details;
  return res.status(statusCode).json({ success: false, error });
};

module.exports = { sendSuccess, sendError };