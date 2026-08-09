'use strict';

const applicationsRepository = require('./applications.repository');
const stepsRepository = require('./steps.repository');
const fieldsRepository = require('./fields.repository');
const { User, Resume } = require('../../database');
const { createHttpError } = require('../../shared/utils');
const { findOrCreateById: findOrCreateUser } = require('../users/users.repository');

const VALID_APP_STATUSES = new Set(['in_progress', 'completed', 'cancelled']);
const VALID_STEP_STATUSES = new Set(['pending', 'in_progress', 'completed', 'skipped']);
const VALID_FIELD_TYPES = new Set([
  'text',
  'select',
  'textarea',
  'checkbox',
  'radio',
  'date',
  'file',
]);
const VALID_FIELD_STATUSES = new Set(['pending', 'filled', 'skipped', 'error']);

const createApplication = async ({ userId, resumeId, jobTitle, company, jobUrl }) => {

  await findOrCreateUser(userId);

  const resume = await Resume.findByPk(resumeId);
  if (!resume) throw createHttpError(422, 'Resume not found', 'RESUME_NOT_FOUND');

  return applicationsRepository.create({ userId, resumeId, jobTitle, company, jobUrl });
};

const getApplications = async ({ userId } = {}) => {
  return applicationsRepository.findAll({ userId });
};

const getApplicationById = async (id) => {
  const app = await applicationsRepository.findByIdWithDetails(id);
  if (!app) throw createHttpError(404, 'Application not found', 'NOT_FOUND');
  return app;
};

const updateApplication = async (id, data) => {
  if (data.status !== undefined && !VALID_APP_STATUSES.has(data.status)) {
    throw createHttpError(
      422,
      `Invalid status. Allowed values: ${[...VALID_APP_STATUSES].join(', ')}`,
      'INVALID_STATUS'
    );
  }
  const app = await applicationsRepository.update(id, data);
  if (!app) throw createHttpError(404, 'Application not found', 'NOT_FOUND');
  return app;
};

const createStep = async (applicationId, { stepName, stepIndex }) => {
  const app = await applicationsRepository.findById(applicationId);
  if (!app) throw createHttpError(404, 'Application not found', 'NOT_FOUND');

  const duplicate = await stepsRepository.findByIndex(applicationId, stepIndex);
  if (duplicate) {
    throw createHttpError(
      409,
      `A step at index ${stepIndex} already exists for this application`,
      'DUPLICATE_STEP_ORDER'
    );
  }

  return stepsRepository.create({ applicationId, stepName, stepIndex });
};

const getSteps = async (applicationId) => {
  const app = await applicationsRepository.findById(applicationId);
  if (!app) throw createHttpError(404, 'Application not found', 'NOT_FOUND');
  return stepsRepository.findByApplication(applicationId);
};

const updateStep = async (stepId, data) => {
  if (data.status !== undefined && !VALID_STEP_STATUSES.has(data.status)) {
    throw createHttpError(
      422,
      `Invalid status. Allowed values: ${[...VALID_STEP_STATUSES].join(', ')}`,
      'INVALID_STATUS'
    );
  }

  const step = await stepsRepository.findById(stepId);
  if (!step) throw createHttpError(404, 'Step not found', 'NOT_FOUND');

  if (data.stepIndex !== undefined && data.stepIndex !== step.stepIndex) {
    const duplicate = await stepsRepository.findByIndex(step.applicationId, data.stepIndex, stepId);
    if (duplicate) {
      throw createHttpError(
        409,
        `A step at index ${data.stepIndex} already exists for this application`,
        'DUPLICATE_STEP_ORDER'
      );
    }
  }

  return stepsRepository.update(stepId, data);
};

const createField = async (stepId, { fieldLabel, fieldType = 'text', fieldSelector }) => {
  const step = await stepsRepository.findById(stepId);
  if (!step) throw createHttpError(404, 'Step not found', 'NOT_FOUND');

  const normalizedFieldType = VALID_FIELD_TYPES.has(fieldType) ? fieldType : 'text';

  return fieldsRepository.create({ stepId, fieldLabel, fieldType: normalizedFieldType, fieldSelector });
};

const getFields = async (stepId) => {
  const step = await stepsRepository.findById(stepId);
  if (!step) throw createHttpError(404, 'Step not found', 'NOT_FOUND');
  return fieldsRepository.findByStep(stepId);
};

const updateField = async (fieldId, data) => {
  if (data.status !== undefined && !VALID_FIELD_STATUSES.has(data.status)) {
    throw createHttpError(
      422,
      `Invalid status. Allowed values: ${[...VALID_FIELD_STATUSES].join(', ')}`,
      'INVALID_STATUS'
    );
  }
  if (data.fieldType !== undefined && !VALID_FIELD_TYPES.has(data.fieldType)) {
    throw createHttpError(
      422,
      `Invalid fieldType. Allowed values: ${[...VALID_FIELD_TYPES].join(', ')}`,
      'INVALID_FIELD_TYPE'
    );
  }
  if (data.confidence !== undefined) {
    const c = Number(data.confidence);
    if (!Number.isFinite(c) || c < 0 || c > 1) {
      throw createHttpError(
        422,
        'confidence must be a number between 0 and 1',
        'INVALID_CONFIDENCE'
      );
    }
    data.confidence = c;
  }
  if (data.retryCount !== undefined) {
    const r = parseInt(data.retryCount, 10);
    if (!Number.isFinite(r) || r < 0) {
      throw createHttpError(
        422,
        'retryCount must be a non-negative integer',
        'INVALID_RETRY_COUNT'
      );
    }
    data.retryCount = r;
  }

  const field = await fieldsRepository.update(fieldId, data);
  if (!field) throw createHttpError(404, 'Field not found', 'NOT_FOUND');
  return field;
};

const confirmApplication = async (id, { confirmedBy }) => {
  const app = await applicationsRepository.findById(id);
  if (!app) throw createHttpError(404, 'Application not found', 'NOT_FOUND');

  if (app.status === 'cancelled') {
    throw createHttpError(409, 'Cannot confirm a cancelled application', 'APPLICATION_CANCELLED');
  }

  if (app.userConfirmedAt) return app;

  return applicationsRepository.update(id, {
    userConfirmedAt: new Date(),
    confirmedBy: String(confirmedBy).slice(0, 255),
  });
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  confirmApplication,
  createStep,
  getSteps,
  updateStep,
  createField,
  getFields,
  updateField,
};