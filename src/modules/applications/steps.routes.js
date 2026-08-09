'use strict';

const { Router } = require('express');
const controller = require('./steps.controller');
const { validate } = require('../../middleware/validate');

const router = Router({ mergeParams: true });

router.patch('/:stepId', controller.update);

router.post(
  '/:stepId/fields',
  validate({ body: { fieldLabel: 'required|string' } }),
  controller.createField
);

router.get('/:stepId/fields', controller.getFields);

module.exports = router;