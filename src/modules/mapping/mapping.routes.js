'use strict';

const { Router } = require('express');
const { sendError } = require('../../shared/utils');

const router = Router();

router.post('/', (_req, res) => sendError(res, 'Not implemented yet', 501, 'NOT_IMPLEMENTED'));

module.exports = router;