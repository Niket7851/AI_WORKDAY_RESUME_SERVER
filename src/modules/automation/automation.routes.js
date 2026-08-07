'use strict';

const { Router } = require('express');
const { sendError } = require('../../shared/utils');

const router = Router();

// Placeholder — to be implemented in a later phase
router.post('/start', (_req, res) => sendError(res, 'Not implemented yet', 501, 'NOT_IMPLEMENTED'));
router.post('/confirm', (_req, res) =>
  sendError(res, 'Not implemented yet', 501, 'NOT_IMPLEMENTED')
);

module.exports = router;
