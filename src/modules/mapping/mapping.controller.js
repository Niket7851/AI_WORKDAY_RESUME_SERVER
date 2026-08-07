'use strict';

const mappingService = require('./mapping.service');
const { asyncHandler, sendSuccess } = require('../../shared/utils');

/**
 * POST /api/v1/fields/:fieldId/map
 *
 * Run AI semantic mapping for the first time.
 * 409 if already mapped — use /remap to re-run.
 */
const mapField = asyncHandler(async (req, res) => {
  const { mapping, created } = await mappingService.mapField(req.params.fieldId);
  sendSuccess(res, mapping, created ? 201 : 200);
});

/**
 * POST /api/v1/fields/:fieldId/remap
 *
 * Re-run AI mapping, replacing any previous result and clearing any override.
 */
const remapField = asyncHandler(async (req, res) => {
  const { mapping } = await mappingService.remapField(req.params.fieldId);
  sendSuccess(res, mapping);
});

/**
 * POST /api/v1/fields/:fieldId/override
 *
 * Apply a manual user override to an existing mapping.
 * Body: { overrideValue: string, userId?: string }
 */
const overrideMapping = asyncHandler(async (req, res) => {
  const { overrideValue, userId } = req.body;
  const mapping = await mappingService.overrideMapping(req.params.fieldId, {
    overrideValue,
    userId,
  });
  sendSuccess(res, mapping);
});

module.exports = { mapField, remapField, overrideMapping };
