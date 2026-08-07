'use strict';

const { Router } = require('express');
const resumesController = require('./resumes.controller');
const { resumeUpload } = require('./resume.validation');

const router = Router();

/**
 * Wraps multer middleware in a promise so errors are forwarded to the global
 * error handler instead of crashing Express with an unhandled callback error.
 * Multer's LIMIT_FILE_SIZE and fileFilter errors both land in errorHandler.js.
 */
const uploadMiddleware = (req, res, next) => {
  resumeUpload.single('file')(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

// POST /api/v1/resumes  — upload + text-extract + AI parse + persist
router.post('/', uploadMiddleware, resumesController.create);

// POST /api/v1/resumes/:id/parse  — (re-)trigger AI parsing for a stored resume
router.post('/:id/parse', resumesController.parseById);

// GET /api/v1/resumes   — list with full structured data (optional ?userId=)
router.get('/', resumesController.getAll);

// GET /api/v1/resumes/:id  — single resume with all sub-tables
router.get('/:id', resumesController.getById);

// DELETE /api/v1/resumes/:id — delete record + file from disk
router.delete('/:id', resumesController.remove);

module.exports = router;
