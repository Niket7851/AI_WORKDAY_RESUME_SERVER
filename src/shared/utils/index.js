'use strict';

const { sendSuccess, sendError } = require('./response');

const createHttpError = (statusCode, message, code = null) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (code) err.code = code;
  return err;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { createHttpError, asyncHandler, sendSuccess, sendError };