'use strict';

const { Router } = require('express');
const fieldController = require('./fields.controller');
const mappingController = require('../mapping/mapping.controller');

const router = Router();

router.patch('/:fieldId', fieldController.update);

router.post('/:fieldId/map', mappingController.mapField);

router.post('/:fieldId/remap', mappingController.remapField);

router.post('/:fieldId/override', mappingController.overrideMapping);

module.exports = router;