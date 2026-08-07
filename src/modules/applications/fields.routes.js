'use strict';

const { Router } = require('express');
const fieldController = require('./fields.controller');
const mappingController = require('../mapping/mapping.controller');

const router = Router();

// PATCH /api/v1/fields/:fieldId
router.patch('/:fieldId', fieldController.update);

// POST /api/v1/fields/:fieldId/map    — run AI mapping for the first time
router.post('/:fieldId/map', mappingController.mapField);

// POST /api/v1/fields/:fieldId/remap  — re-run AI mapping (replaces previous)
router.post('/:fieldId/remap', mappingController.remapField);

// POST /api/v1/fields/:fieldId/override — apply a manual user override
router.post('/:fieldId/override', mappingController.overrideMapping);

module.exports = router;
