'use strict';

const mappingRepository = require('./mapping.repository');
const fieldsRepository = require('../applications/fields.repository');
const stepsRepository = require('../applications/steps.repository');
const applicationsRepository = require('../applications/applications.repository');
const { aiService } = require('../ai/ai.service');
const { createHttpError } = require('../../shared/utils');

const resumesRepository = require('../resumes/resumes.repository');
const { parseById: parseResumeById } = require('../resumes/resumes.service');

const logger = {
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'warn', msg, ...meta })), 
};

const REVIEW_THRESHOLD = 0.7; 

const omitNulls = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));

const buildResumeContext = (resume) => {
  const ctx = {};

  if (resume.contactInfo) {
    ctx.contact = omitNulls({
      fullName: resume.contactInfo.fullName,
      email: resume.contactInfo.email,
      phone: resume.contactInfo.phone,
      location: resume.contactInfo.address,
      linkedIn: resume.contactInfo.linkedIn,
      website: resume.contactInfo.website,
    });
  }

  if (resume.experiences?.length) {
    ctx.workExperience = resume.experiences.map((e) =>
      omitNulls({
        jobTitle: e.title,
        company: e.company,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.isCurrent,
        description: e.description ? e.description.slice(0, 400) : undefined,
      })
    );
  }

  if (resume.educations?.length) {
    ctx.education = resume.educations.map((e) =>
      omitNulls({
        degree: e.degree,
        institution: e.institution,
        startDate: e.startDate,
        endDate: e.endDate,
        gpa: e.gpa != null ? String(e.gpa) : undefined,
      })
    );
  }

  if (resume.skills?.length) {
    ctx.skills = resume.skills.map((s) => omitNulls({ name: s.name, category: s.category }));
  }

  if (resume.certifications?.length) {
    ctx.certifications = resume.certifications.map((c) =>
      omitNulls({
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate,
        expiryDate: c.expirationDate,
        credentialId: c.credentialId,
      })
    );
  }

  return ctx;
};

const loadFieldContext = async (fieldId) => {
  const field = await fieldsRepository.findById(fieldId);
  if (!field) throw createHttpError(404, 'Field not found', 'NOT_FOUND');

  const step = await stepsRepository.findById(field.stepId);
  if (!step) throw createHttpError(404, 'Step not found', 'NOT_FOUND');

  const application = await applicationsRepository.findById(step.applicationId);
  if (!application) throw createHttpError(404, 'Application not found', 'NOT_FOUND');

  let resume = await resumesRepository.findById(application.resumeId);
  if (!resume) throw createHttpError(404, 'Resume not found', 'NOT_FOUND');

  if (!resume.contactInfo) {
    logger.warn('Resume contactInfo missing; attempting inline re-parse', { resumeId: resume.id });
    try {
      await parseResumeById(resume.id);

      resume = await resumesRepository.findById(application.resumeId);
    } catch (parseErr) {
      logger.warn('Inline re-parse failed', { resumeId: resume.id, code: parseErr.code });
    }

    if (!resume.contactInfo) {
      logger.warn('Proceeding with empty resume context — mapping accuracy will be reduced', {
        resumeId: resume.id,
      });
    }
  }

  const resumeContext = buildResumeContext(resume);
  return { field, resume, resumeContext };
};

const runMapping = async (fieldId, force) => {
  const { field, resumeContext } = await loadFieldContext(fieldId);

  if (!force) {
    const existing = await mappingRepository.findByFieldId(fieldId);
    if (existing) {
      throw createHttpError(
        409,
        'Field is already mapped. Use POST /fields/:fieldId/remap to re-map.',
        'ALREADY_MAPPED'
      );
    }
  }

  const fieldMeta = {
    label: field.fieldLabel,
    type: field.fieldType,
    selector: field.fieldSelector || undefined,
  };

  let aiResult;
  try {
    aiResult = await aiService.mapField(fieldMeta, resumeContext);
  } catch (err) {

    logger.warn('AI field mapping failed', { fieldId, code: err.code });
    throw err;
  }

  const requiresReview = aiResult.confidence < REVIEW_THRESHOLD || aiResult.status !== 'mapped';

  const { mapping, created } = await mappingRepository.upsertByFieldId(fieldId, {
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    resumeField: aiResult.resume_path,
    mappedValue: aiResult.mapped_value,
    mappingMethod: 'ai',
    confidence: aiResult.confidence,
    reason: aiResult.reason,
    mappingStatus: aiResult.status,
  });

  await fieldsRepository.update(fieldId, {
    filledValue: aiResult.mapped_value || null,
    confidence: aiResult.confidence,
    requiresReview,
    status: aiResult.status === 'mapped' ? 'filled' : 'pending',
  });

  return { mapping: mapping.toJSON ? mapping.toJSON() : mapping, created };
};

const mapField = (fieldId) => runMapping(fieldId, false);

const remapField = (fieldId) => runMapping(fieldId, true);

const overrideMapping = async (fieldId, { overrideValue, userId }) => {
  if (typeof overrideValue !== 'string' || overrideValue.trim().length === 0) {
    throw createHttpError(422, 'overrideValue must be a non-empty string', 'VALIDATION_ERROR');
  }

  const existing = await mappingRepository.findByFieldId(fieldId);
  if (!existing) {
    throw createHttpError(
      404,
      'No mapping found for this field. Run POST /fields/:fieldId/map first.',
      'MAPPING_NOT_FOUND'
    );
  }

  const mapping = await mappingRepository.update(existing.id, {
    overrideValue: overrideValue.trim(),
    overriddenBy: userId || null,
    mappingStatus: 'overridden',
    mappingMethod: 'override',
    isVerified: true,
  });

  await fieldsRepository.update(fieldId, {
    filledValue: overrideValue.trim(),
    requiresReview: false,
    status: 'filled',
  });

  return mapping.toJSON ? mapping.toJSON() : mapping;
};

module.exports = { mapField, remapField, overrideMapping };