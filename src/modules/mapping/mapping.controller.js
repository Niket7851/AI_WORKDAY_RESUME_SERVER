'use strict';

const mappingService = require('./mapping.service');
const { asyncHandler, sendSuccess } = require('../../shared/utils');

const mapField = asyncHandler(async (req, res) => {
  const { mapping, created } = await mappingService.mapField(req.params.fieldId);
  sendSuccess(res, mapping, created ? 201 : 200);
});

const remapField = asyncHandler(async (req, res) => {
  const { mapping } = await mappingService.remapField(req.params.fieldId);
  sendSuccess(res, mapping);
});

const overrideMapping = asyncHandler(async (req, res) => {
  const { overrideValue, userId } = req.body;
  const mapping = await mappingService.overrideMapping(req.params.fieldId, {
    overrideValue,
    userId,
  });
  sendSuccess(res, mapping);
});

module.exports = { mapField, remapField, overrideMapping };