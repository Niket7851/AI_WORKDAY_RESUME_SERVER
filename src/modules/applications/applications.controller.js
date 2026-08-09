'use strict';

const service = require('./applications.service');
const { asyncHandler, sendSuccess } = require('../../shared/utils');

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

const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.userId) filters.userId = req.query.userId;
  const applications = await service.getApplications(filters);
  sendSuccess(res, applications);
});

const getById = asyncHandler(async (req, res) => {
  const application = await service.getApplicationById(req.params.id);
  sendSuccess(res, application);
});

const update = asyncHandler(async (req, res) => {
  const application = await service.updateApplication(req.params.id, req.body);
  sendSuccess(res, application);
});

const createStep = asyncHandler(async (req, res) => {
  const { stepName, stepIndex } = req.body;
  const step = await service.createStep(req.params.id, { stepName, stepIndex });
  sendSuccess(res, step, 201);
});

const getSteps = asyncHandler(async (req, res) => {
  const steps = await service.getSteps(req.params.id);
  sendSuccess(res, steps);
});

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