'use strict';

const { createHttpError } = require('../shared/utils');

const validate = (spec) => (req, _res, next) => {
  const errors = [];

  const checkField = (source, fieldName, rules, sourceLabel) => {
    const ruleList = rules.split('|').map((r) => r.trim());
    const value = source[fieldName];
    const isPresent = value !== undefined && value !== null && value !== '';

    for (const rule of ruleList) {
      if (rule === 'required') {
        if (!isPresent) {
          errors.push({
            field: `${sourceLabel}.${fieldName}`,
            message: `${fieldName} is required`,
          });
          return; 
        }
      }

      if (!isPresent) continue; 

      if (rule === 'string' && typeof value !== 'string') {
        errors.push({
          field: `${sourceLabel}.${fieldName}`,
          message: `${fieldName} must be a string`,
        });
      }
      if (rule === 'number' && typeof value !== 'number') {
        errors.push({
          field: `${sourceLabel}.${fieldName}`,
          message: `${fieldName} must be a number`,
        });
      }
      if (rule === 'boolean' && typeof value !== 'boolean') {
        errors.push({
          field: `${sourceLabel}.${fieldName}`,
          message: `${fieldName} must be a boolean`,
        });
      }
      if (rule === 'uuid') {
        const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRe.test(String(value))) {
          errors.push({
            field: `${sourceLabel}.${fieldName}`,
            message: `${fieldName} must be a valid UUID`,
          });
        }
      }
      if (rule === 'email') {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(String(value))) {
          errors.push({
            field: `${sourceLabel}.${fieldName}`,
            message: `${fieldName} must be a valid email`,
          });
        }
      }
      if (rule.startsWith('max:')) {
        const max = parseInt(rule.split(':')[1], 10);
        const len = typeof value === 'string' ? value.length : value;
        if (len > max) {
          errors.push({
            field: `${sourceLabel}.${fieldName}`,
            message: `${fieldName} must not exceed ${max}`,
          });
        }
      }
      if (rule.startsWith('min:')) {
        const min = parseInt(rule.split(':')[1], 10);
        const len = typeof value === 'string' ? value.length : value;
        if (len < min) {
          errors.push({
            field: `${sourceLabel}.${fieldName}`,
            message: `${fieldName} must be at least ${min}`,
          });
        }
      }
    }
  };

  if (spec.body) {
    for (const [field, rules] of Object.entries(spec.body)) {
      checkField(req.body || {}, field, rules, 'body');
    }
  }
  if (spec.params) {
    for (const [field, rules] of Object.entries(spec.params)) {
      checkField(req.params || {}, field, rules, 'params');
    }
  }
  if (spec.query) {
    for (const [field, rules] of Object.entries(spec.query)) {
      checkField(req.query || {}, field, rules, 'query');
    }
  }

  if (errors.length > 0) {
    const err = createHttpError(422, 'Validation failed', 'VALIDATION_ERROR');
    err.details = errors;
    return next(err);
  }

  next();
};

const validateUuidParam = (paramName = 'id') =>
  validate({ params: { [paramName]: 'required|uuid' } });

module.exports = { validate, validateUuidParam };