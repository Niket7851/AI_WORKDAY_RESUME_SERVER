'use strict';

const fs = require('fs');
const resumesService = require('./resumes.service');
const { sendSuccess, sendError, asyncHandler, createHttpError } = require('../../shared/utils');

// ── File magic-byte signatures ────────────────────────────────────────────────
// Defence-in-depth: verify the actual file content matches the declared type.
// Client-declared MIME types cannot be trusted alone.
const MAGIC_BYTES = {
  'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': Buffer.from([
    0x50, 0x4b, 0x03, 0x04,
  ]), // PK (ZIP)
};

/**
 * Read the first N bytes of a file to check its magic signature.
 * @param {string} filePath
 * @param {number} length
 * @returns {Promise<Buffer>}
 */
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

/**
 * Validate that the saved file's magic bytes match the declared MIME type.
 * Deletes the file and throws 422 if the check fails.
 * @param {string} filePath
 * @param {string} mimetype
 */
async function validateMagicBytes(filePath, mimetype) {
  const expected = MAGIC_BYTES[mimetype];
  if (!expected) return; // No signature known — skip (fileFilter already validated)

  let actual;
  try {
    actual = await readMagicBytes(filePath, expected.length);
  } catch {
    // Cannot read — delete and reject
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

// UUID v4 pattern
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * POST /api/v1/resumes
 *
 * Multer has already saved the file to disk by the time this handler runs.
 * If validation fails before multer saves (fileFilter, file size) the error
 * goes straight to the global error handler — not here.
 *
 * Temporary: userId is taken from the request body until auth middleware is added.
 */
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

  // Validate userId is a well-formed UUID to prevent injection or path confusion.
  if (!UUID_RE.test(userId)) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    throw createHttpError(422, 'userId must be a valid UUID.', 'INVALID_USER_ID');
  }

  // Validate file magic bytes — defence against MIME-spoofed uploads.
  await validateMagicBytes(req.file.path, req.file.mimetype);

  const resume = await resumesService.upload({ file: req.file, userId });
  sendSuccess(res, resume, 201);
});

/**
 * POST /api/v1/resumes/:id/parse
 *
 * Trigger AI parsing on an already-stored resume.
 * Idempotent — replaces any previously stored parsed data.
 * Returns the full structured resume on success.
 */
const parseById = asyncHandler(async (req, res) => {
  const resume = await resumesService.parseById(req.params.id);
  sendSuccess(res, resume);
});

/**
 * GET /api/v1/resumes
 * Optional query param: ?userId=<uuid>
 * Returns structured resume data including all sub-tables.
 */
const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.userId) filters.userId = req.query.userId;
  const resumes = await resumesService.getAll(filters);
  sendSuccess(res, resumes);
});

/**
 * GET /api/v1/resumes/:id
 * Returns structured resume data including contactInfo, experiences,
 * educations, skills, and certifications.
 */
const getById = asyncHandler(async (req, res) => {
  const resume = await resumesService.getById(req.params.id);
  if (!resume) return sendError(res, 'Resume not found', 404, 'NOT_FOUND');
  sendSuccess(res, resume);
});

/**
 * DELETE /api/v1/resumes/:id
 * Deletes the record and the file from disk.
 */
const remove = asyncHandler(async (req, res) => {
  await resumesService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { create, parseById, getAll, getById, remove };
