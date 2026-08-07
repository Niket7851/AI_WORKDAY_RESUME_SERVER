'use strict';

/**
 * Shared utilities — small helpers used across multiple modules.
 * Keep each helper pure and dependency-free where possible.
 */

const { sendSuccess, sendError } = require('./response');

/**
 * Creates an HTTP error with a status code.
 * Attach the error to next(err) in any route/middleware.
 * @param {number} statusCode
 * @param {string} message
 * @param {string} [code]
 * @returns {Error}
 */
const createHttpError = (statusCode, message, code = null) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (code) err.code = code;
  return err;
};

/**
 * Wraps an async route handler so any thrown error is forwarded to next().
 * Eliminates try/catch boilerplate in every controller.
 * @param {Function} fn
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { createHttpError, asyncHandler, sendSuccess, sendError };
