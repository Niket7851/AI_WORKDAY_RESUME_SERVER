'use strict';

const service = require('./applications.service');
const { asyncHandler, sendSuccess } = require('../../shared/utils');

const update = asyncHandler(async (req, res) => {
  const field = await service.updateField(req.params.fieldId, req.body);
  sendSuccess(res, field);
});

module.exports = { update };