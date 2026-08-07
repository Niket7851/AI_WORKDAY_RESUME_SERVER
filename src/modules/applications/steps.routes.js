'use strict';

const { Router } = require('express');
const controller = require('./steps.controller');
const { validate } = require('../../middleware/validate');

const router = Router({ mergeParams: true });

// PATCH /api/v1/steps/:stepId
router.patch('/:stepId', controller.update);

// POST /api/v1/steps/:stepId/fields
router.post(
  '/:stepId/fields',
  validate({ body: { fieldLabel: 'required|string' } }),
  controller.createField
);

// GET /api/v1/steps/:stepId/fields
router.get('/:stepId/fields', controller.getFields);

module.exports = router;
