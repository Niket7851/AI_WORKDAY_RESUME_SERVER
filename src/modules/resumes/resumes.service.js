'use strict';

const path = require('path');
const fs = require('fs');
const resumesRepository = require('./resumes.repository');
const resumeParserService = require('./resume-parser.service');
const { saveParsedResumeData } = require('./resume-parsed-data.repository');
const { uploadDir } = require('./resume.validation');
const { aiService } = require('../ai/ai.service');
const { createHttpError } = require('../../shared/utils');
const { findOrCreateById: findOrCreateUser } = require('../users/users.repository');

// Simple structured logger (no external dependency)
const logger = {
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'warn', msg, ...meta })), // eslint-disable-line no-console
};

/**
 * Increment this when the Gemini prompt or response schema changes so stored
 * records can be identified as needing a re-parse.
 */
const RESUME_PARSER_VERSION = '1.0.0';

/**
 * Resumes service — all business logic for the resumes module.
 * Does not touch Sequelize directly (goes through repositories).
 */

/**
 * Process an uploaded resume file:
 *  1. Parse text from PDF/DOCX.
 *  2. Persist a Resume record.
 *  3. Call Gemini to extract structured data.
 *  4. Persist structured data + stamp parserVersion in one transaction.
 *  5. Return the full structured resume (no raw text).
 *
 * @param {{ file: Express.Multer.File, userId: string }} params
 */
const upload = async ({ file, userId }) => {
  const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';

  // Ensure the User row exists before any FK-constrained inserts.
  // The extension generates a stable UUID; if no row exists yet we create
  // an anonymous placeholder so the FK on resumes.userId is satisfied.
  await findOrCreateUser(userId);

  // Step 1: Extract text — non-fatal
  const parseResult = await resumeParserService.parseFile(file.path, file.mimetype);

  // Step 2: Persist Resume record (rawText preserved, never returned to client)
  const resume = await resumesRepository.create({
    userId,
    originalFileName: file.originalname,
    fileType,
    storedFileName: file.filename,
    rawText: parseResult.success ? parseResult.text : null,
    parsedAt: null,
  });

  // Step 3 & 4: AI parsing — non-fatal; record is kept even if AI fails
  let aiParsingStatus = 'skipped';
  let aiParsingError;

  if (parseResult.success && parseResult.text) {
    try {
      const structuredData = await aiService.parseResume(parseResult.text);
      await saveParsedResumeData(resume.id, structuredData, RESUME_PARSER_VERSION);
      aiParsingStatus = 'success';
    } catch (err) {
      aiParsingStatus = 'failed';
      aiParsingError = err.code || err.message;
      logger.warn('AI parsing failed for resume', { resumeId: resume.id, code: err.code });
    }
  }

  // Step 5: Reload with all sub-tables included
  const full = await resumesRepository.findById(resume.id);

  return {
    ...serializeResume(full),
    textExtractionStatus: parseResult.success ? 'success' : 'failed',
    ...(parseResult.success ? {} : { textExtractionError: parseResult.error }),
    charCount: parseResult.charCount,
    aiParsingStatus,
    ...(aiParsingError ? { aiParsingError } : {}),
  };
};

/**
 * Trigger AI parsing for an already-stored resume.
 * Replaces any previously parsed data in one transaction.
 *
 * @param {string} id  Resume UUID
 */
const parseById = async (id) => {
  const resume = await resumesRepository.findByIdWithText(id);
  if (!resume) throw createHttpError(404, 'Resume not found', 'NOT_FOUND');

  if (!resume.rawText) {
    throw createHttpError(
      422,
      'Resume has no extracted text. Re-upload the file to enable AI parsing.',
      'NO_RAW_TEXT'
    );
  }

  const structuredData = await aiService.parseResume(resume.rawText);
  // Any failure inside saveParsedResumeData rolls back the entire transaction
  await saveParsedResumeData(resume.id, structuredData, RESUME_PARSER_VERSION);

  // Return full structured resume (without rawText)
  const full = await resumesRepository.findById(id);
  return serializeResume(full);
};

/**
 * @param {{ userId?: string }} filters
 */
const getAll = async (filters = {}) => {
  const resumes = await resumesRepository.findAll(filters);
  return resumes.map(serializeResume);
};

const getById = async (id) => {
  const resume = await resumesRepository.findById(id);
  if (!resume) return null;
  return serializeResume(resume);
};

/**
 * Deletes a resume record AND the stored file from disk.
 * @param {string} id
 */
const remove = async (id) => {
  const resume = await resumesRepository.remove(id);
  if (!resume) throw createHttpError(404, 'Resume not found', 'NOT_FOUND');

  if (resume.storedFileName) {
    const filePath = path.join(uploadDir, resume.storedFileName);
    await fs.promises.unlink(filePath).catch(() => {});
  }

  return resume;
};

// ---------------------------------------------------------------------------
// Serializer — converts Sequelize instance to a plain response object
// ---------------------------------------------------------------------------

const serializeResume = (r) => {
  const plain = r.toJSON ? r.toJSON() : r;
  // rawText is always excluded from responses — it's for internal use only
  const { rawText: _rawText, ...safe } = plain; // eslint-disable-line no-unused-vars
  return safe;
};

module.exports = { upload, parseById, getAll, getById, remove, RESUME_PARSER_VERSION };
