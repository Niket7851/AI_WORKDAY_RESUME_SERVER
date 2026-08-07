'use strict';

const service = require('./applications.service');
const { asyncHandler, sendSuccess } = require('../../shared/utils');

/**
 * PATCH /api/v1/fields/:fieldId
 * Body: { fieldLabel?, fieldType?, fieldSelector?, detectedValue?, filledValue?,
 *         confidence?, requiresReview?, status?, retryCount?, errorMessage? }
 */
const update = asyncHandler(async (req, res) => {
  const field = await service.updateField(req.params.fieldId, req.body);
  sendSuccess(res, field);
});

module.exports = { update };
