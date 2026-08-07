'use strict';

const { Router } = require('express');
const controller = require('./applications.controller');
const { validate } = require('../../middleware/validate');

const router = Router();

// POST /api/v1/applications
router.post(
  '/',
  validate({ body: { userId: 'required|uuid', resumeId: 'required|uuid' } }),
  controller.create
);

// GET /api/v1/applications
router.get('/', controller.getAll);

// GET /api/v1/applications/:id
router.get('/:id', controller.getById);

// PATCH /api/v1/applications/:id
router.patch('/:id', controller.update);

// POST /api/v1/applications/:id/confirm
router.post(
  '/:id/confirm',
  validate({ body: { confirmedBy: 'required|string' } }),
  controller.confirm
);

// POST /api/v1/applications/:id/steps
router.post(
  '/:id/steps',
  validate({ body: { stepName: 'required|string', stepIndex: 'required|number' } }),
  controller.createStep
);

// GET /api/v1/applications/:id/steps
router.get('/:id/steps', controller.getSteps);

module.exports = router;
