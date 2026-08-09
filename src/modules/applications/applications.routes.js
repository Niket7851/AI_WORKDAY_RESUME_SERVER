'use strict';

const { Router } = require('express');
const controller = require('./applications.controller');
const { validate } = require('../../middleware/validate');

const router = Router();

router.post(
  '/',
  validate({ body: { userId: 'required|uuid', resumeId: 'required|uuid' } }),
  controller.create
);

router.get('/', controller.getAll);

router.get('/:id', controller.getById);

router.patch('/:id', controller.update);

router.post(
  '/:id/confirm',
  validate({ body: { confirmedBy: 'required|string' } }),
  controller.confirm
);

router.post(
  '/:id/steps',
  validate({ body: { stepName: 'required|string', stepIndex: 'required|number' } }),
  controller.createStep
);

router.get('/:id/steps', controller.getSteps);

module.exports = router;