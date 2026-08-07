'use strict';

const {
  Resume,
  ResumeContactInfo,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeCertification,
} = require('../../database');

/**
 * Resumes repository — the ONLY place that talks directly to the Resume model.
 * No business logic, no AI calls, no file I/O here.
 */

// Shared include definition for all sub-tables (rawText always excluded)
const FULL_INCLUDE = [
  { model: ResumeContactInfo, as: 'contactInfo' },
  { model: ResumeExperience, as: 'experiences', order: [['sortOrder', 'ASC']] },
  { model: ResumeEducation, as: 'educations', order: [['sortOrder', 'ASC']] },
  { model: ResumeSkill, as: 'skills', order: [['sortOrder', 'ASC']] },
  { model: ResumeCertification, as: 'certifications', order: [['sortOrder', 'ASC']] },
];

const findAll = async ({ userId } = {}) => {
  const where = userId ? { userId } : {};
  return Resume.findAll({
    where,
    attributes: { exclude: ['rawText'] },
    include: FULL_INCLUDE,
    order: [['createdAt', 'DESC']],
  });
};

const findById = async (id) => {
  return Resume.findByPk(id, {
    attributes: { exclude: ['rawText'] },
    include: FULL_INCLUDE,
  });
};

/** Includes rawText — only called when AI parsing needs the original text. */
const findByIdWithText = async (id) => {
  return Resume.findByPk(id);
};

const create = async ({
  userId,
  originalFileName,
  fileType,
  storedFileName,
  rawText,
  parsedAt,
}) => {
  return Resume.create({
    userId,
    originalFileName,
    fileType,
    storedFileName,
    rawText,
    parsedAt,
  });
};

const update = async (id, data) => {
  const resume = await Resume.findByPk(id);
  if (!resume) return null;
  return resume.update(data);
};

const remove = async (id) => {
  const resume = await Resume.findByPk(id);
  if (!resume) return null;
  await resume.destroy();
  return resume;
};

module.exports = { findAll, findById, findByIdWithText, create, update, remove };
