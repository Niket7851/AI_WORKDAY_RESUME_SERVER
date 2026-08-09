'use strict';

const { Router } = require('express');
const resumesController = require('./resumes.controller');
const { resumeUpload } = require('./resume.validation');

const router = Router();

const uploadMiddleware = (req, res, next) => {
  resumeUpload.single('file')(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.post('/', uploadMiddleware, resumesController.create);

router.post('/:id/parse', resumesController.parseById);

router.get('/', resumesController.getAll);

router.get('/:id', resumesController.getById);

router.delete('/:id', resumesController.remove);

module.exports = router;