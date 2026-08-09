'use strict';

const fs = require('fs');
const resumesService = require('./resumes.service');
const { sendSuccess, sendError, asyncHandler, createHttpError } = require('../../shared/utils');

const MAGIC_BYTES = {
  'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]), 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': Buffer.from([
    0x50, 0x4b, 0x03, 0x04,
  ]), 
};

async function readMagicBytes(filePath, length) {
  const fd = await fs.promises.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(length);
    await fd.read(buf, 0, length, 0);
    return buf;
  } finally {
    await fd.close();
  }
}

async function validateMagicBytes(filePath, mimetype) {
  const expected = MAGIC_BYTES[mimetype];
  if (!expected) return; 

  let actual;
  try {
    actual = await readMagicBytes(filePath, expected.length);
  } catch {

    await fs.promises.unlink(filePath).catch(() => {});
    throw createHttpError(422, 'Uploaded file could not be read.', 'FILE_READ_ERROR');
  }

  if (!actual.slice(0, expected.length).equals(expected)) {
    await fs.promises.unlink(filePath).catch(() => {});
    throw createHttpError(
      422,
      'File content does not match the declared file type. Please upload a genuine PDF or DOCX.',
      'FILE_CONTENT_MISMATCH'
    );
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createHttpError(422, 'A resume file (PDF or DOCX) is required.', 'FILE_REQUIRED');
  }

  const { userId } = req.body;
  if (!userId) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    throw createHttpError(
      422,
      'userId is required (temporary — will be replaced by auth).',
      'USER_ID_REQUIRED'
    );
  }

  if (!UUID_RE.test(userId)) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    throw createHttpError(422, 'userId must be a valid UUID.', 'INVALID_USER_ID');
  }

  await validateMagicBytes(req.file.path, req.file.mimetype);

  const resume = await resumesService.upload({ file: req.file, userId });
  sendSuccess(res, resume, 201);
});

const parseById = asyncHandler(async (req, res) => {
  const resume = await resumesService.parseById(req.params.id);
  sendSuccess(res, resume);
});

const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.userId) filters.userId = req.query.userId;
  const resumes = await resumesService.getAll(filters);
  sendSuccess(res, resumes);
});

const getById = asyncHandler(async (req, res) => {
  const resume = await resumesService.getById(req.params.id);
  if (!resume) return sendError(res, 'Resume not found', 404, 'NOT_FOUND');
  sendSuccess(res, resume);
});

const remove = asyncHandler(async (req, res) => {
  await resumesService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { create, parseById, getAll, getById, remove };