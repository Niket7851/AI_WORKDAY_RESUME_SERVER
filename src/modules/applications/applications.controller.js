'use strict';

const service = require('./applications.service');
const { asyncHandler, sendSuccess } = require('../../shared/utils');

/**
 * POST /api/v1/applications
 * Body: { userId, resumeId, jobTitle?, company?, jobUrl? }
 */
const create = asyncHandler(async (req, res) => {
  const { userId, resumeId, jobTitle, company, jobUrl } = req.body;
  const application = await service.createApplication({
    userId,
    resumeId,
    jobTitle,
    company,
    jobUrl,
  });
  sendSuccess(res, application, 201);
});

/**
 * GET /api/v1/applications
 * Query: ?userId=<uuid>
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.userId) filters.userId = req.query.userId;
  const applications = await service.getApplications(filters);
  sendSuccess(res, applications);
});

/**
 * GET /api/v1/applications/:id
 * Returns application with all steps and fields.
 */
const getById = asyncHandler(async (req, res) => {
  const application = await service.getApplicationById(req.params.id);
  sendSuccess(res, application);
});

/**
 * PATCH /api/v1/applications/:id
 * Body: { jobTitle?, company?, jobUrl?, status? }
 */
const update = asyncHandler(async (req, res) => {
  const application = await service.updateApplication(req.params.id, req.body);
  sendSuccess(res, application);
});

/**
 * POST /api/v1/applications/:id/steps
 * Body: { stepName, stepIndex }
 */
const createStep = asyncHandler(async (req, res) => {
  const { stepName, stepIndex } = req.body;
  const step = await service.createStep(req.params.id, { stepName, stepIndex });
  sendSuccess(res, step, 201);
});

/**
 * GET /api/v1/applications/:id/steps
 */
const getSteps = asyncHandler(async (req, res) => {
  const steps = await service.getSteps(req.params.id);
  sendSuccess(res, steps);
});

/**
 * POST /api/v1/applications/:id/confirm
 * Body: { confirmedBy }
 *
 * Records user_confirmed_at and confirmed_by on the application.
 * This MUST be called before the extension is permitted to trigger
 * final form submission — the extension checks this server-side
 * flag before calling explicitSubmit().
 */
const confirm = asyncHandler(async (req, res) => {
  const { confirmedBy } = req.body;
  if (!confirmedBy) {
    const err = new Error('confirmedBy is required');
    err.statusCode = 422;
    throw err;
  }
  const application = await service.confirmApplication(req.params.id, { confirmedBy });
  sendSuccess(res, application);
});

module.exports = { create, getAll, getById, update, confirm, createStep, getSteps };
