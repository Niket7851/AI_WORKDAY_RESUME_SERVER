'use strict';

/**
 * Consistent API response helpers.
 *
 * All controllers must use these helpers — never call res.json() directly with
 * an ad-hoc shape.
 *
 * Success envelope:
 *   { success: true, data: <payload>, meta?: <pagination/counts> }
 *
 * Error envelope:
 *   { success: false, error: { message, code?, details? } }
 */

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {number} [statusCode=200]
 * @param {object|null} [meta=null]  optional metadata (pagination, totals, etc.)
 */
const sendSuccess = (res, data, statusCode = 200, meta = null) => {
  const body = { success: true, data };
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {string|null} [code=null]     machine-readable error code
 * @param {Array|null}  [details=null]  field-level validation errors
 */
const sendError = (res, message, statusCode = 500, code = null, details = null) => {
  const error = { message };
  if (code) error.code = code;
  if (details && details.length > 0) error.details = details;
  return res.status(statusCode).json({ success: false, error });
};

module.exports = { sendSuccess, sendError };
