'use strict';

const service = require('./applications.service');
const { asyncHandler, sendSuccess } = require('../../shared/utils');

/**
 * PATCH /api/v1/steps/:stepId
 * Body: { stepName?, stepIndex?, status?, completedAt? }
 */
const update = asyncHandler(async (req, res) => {
  const step = await service.updateStep(req.params.stepId, req.body);
  sendSuccess(res, step);
});

/**
 * POST /api/v1/steps/:stepId/fields
 * Body: { fieldLabel, fieldType?, fieldSelector? }
 */
const createField = asyncHandler(async (req, res) => {
  const { fieldLabel, fieldType, fieldSelector } = req.body;
  const field = await service.createField(req.params.stepId, {
    fieldLabel,
    fieldType,
    fieldSelector,
  });
  sendSuccess(res, field, 201);
});

/**
 * GET /api/v1/steps/:stepId/fields
 */
const getFields = asyncHandler(async (req, res) => {
  const fields = await service.getFields(req.params.stepId);
  sendSuccess(res, fields);
});

module.exports = { update, createField, getFields };
