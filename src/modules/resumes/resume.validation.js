'use strict';

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const config = require('../../config');
const { createHttpError } = require('../../shared/utils');

// ── Allowed file types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = Object.freeze({
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
});

// ── Upload directory ──────────────────────────────────────────────────────────
// Resolved from the project root (not the src directory) so uploaded files are
// never inside the source tree and never served as static assets.
const uploadDir = path.resolve(process.cwd(), config.uploads.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Disk storage ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),

  // Use a UUID-based filename to prevent collisions and path-traversal attacks.
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

// ── File filter ───────────────────────────────────────────────────────────────
// Validates MIME type AND extension, and ensures they agree with each other.
// Runs before any bytes are written to disk.
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const expectedExt = ALLOWED_MIME_TYPES[file.mimetype];

  if (!expectedExt) {
    return cb(
      createHttpError(
        422,
        `File type "${file.mimetype}" is not supported. Please upload a PDF or DOCX file.`,
        'UNSUPPORTED_FILE_TYPE'
      )
    );
  }

  if (ext !== expectedExt) {
    return cb(
      createHttpError(
        422,
        `File extension "${ext}" does not match the declared type "${file.mimetype}".`,
        'MIME_EXTENSION_MISMATCH'
      )
    );
  }

  cb(null, true);
};

// ── Multer instance ───────────────────────────────────────────────────────────
const maxFileSizeBytes = config.uploads.maxFileSizeMb * 1024 * 1024;

const resumeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1, // one resume file per request
    fields: 10, // cap non-file fields to prevent abuse
  },
});

module.exports = { resumeUpload, ALLOWED_MIME_TYPES, uploadDir };
