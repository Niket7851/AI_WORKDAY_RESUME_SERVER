'use strict';

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const config = require('../../config');
const { createHttpError } = require('../../shared/utils');

const ALLOWED_MIME_TYPES = Object.freeze({
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
});

const uploadDir = path.resolve(process.cwd(), config.uploads.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

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

const maxFileSizeBytes = config.uploads.maxFileSizeMb * 1024 * 1024;

const resumeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeBytes,
    files: 1, 
    fields: 10, 
  },
});

module.exports = { resumeUpload, ALLOWED_MIME_TYPES, uploadDir };