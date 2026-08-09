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

const logger = {
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'warn', msg, ...meta })), 
};

const RESUME_PARSER_VERSION = '1.0.0';

const upload = async ({ file, userId }) => {
  const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';

  await findOrCreateUser(userId);

  const parseResult = await resumeParserService.parseFile(file.path, file.mimetype);

  const resume = await resumesRepository.create({
    userId,
    originalFileName: file.originalname,
    fileType,
    storedFileName: file.filename,
    rawText: parseResult.success ? parseResult.text : null,
    parsedAt: null,
  });

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

  let aiParsingStatus = 'success';
  let aiParsingError;
  try {
    const structuredData = await aiService.parseResume(resume.rawText);
    await saveParsedResumeData(resume.id, structuredData, RESUME_PARSER_VERSION);
  } catch (err) {
    aiParsingStatus = 'failed';
    aiParsingError = err.code || err.message;
    logger.warn('AI parsing failed in parseById', { resumeId: id, code: err.code });
  }

  const full = await resumesRepository.findById(id);
  return {
    ...serializeResume(full),
    aiParsingStatus,
    ...(aiParsingError ? { aiParsingError } : {}),
  };
};

const getAll = async (filters = {}) => {
  const resumes = await resumesRepository.findAll(filters);
  return resumes.map(serializeResume);
};

const getById = async (id) => {
  const resume = await resumesRepository.findById(id);
  if (!resume) return null;
  return serializeResume(resume);
};

const remove = async (id) => {
  const resume = await resumesRepository.remove(id);
  if (!resume) throw createHttpError(404, 'Resume not found', 'NOT_FOUND');

  if (resume.storedFileName) {
    const filePath = path.join(uploadDir, resume.storedFileName);
    await fs.promises.unlink(filePath).catch(() => {});
  }

  return resume;
};

const serializeResume = (r) => {
  const plain = r.toJSON ? r.toJSON() : r;

  const { rawText: _rawText, ...safe } = plain; 
  return safe;
};

module.exports = { upload, parseById, getAll, getById, remove, RESUME_PARSER_VERSION };