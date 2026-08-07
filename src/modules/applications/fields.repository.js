'use strict';

const { ApplicationField } = require('../../database');

const findById = async (id) => {
  return ApplicationField.findByPk(id);
};

const findByStep = async (stepId) => {
  return ApplicationField.findAll({
    where: { stepId },
    order: [['createdAt', 'ASC']],
  });
};

const create = async ({ stepId, fieldLabel, fieldType, fieldSelector }) => {
  return ApplicationField.create({ stepId, fieldLabel, fieldType, fieldSelector });
};

const update = async (id, data) => {
  const field = await ApplicationField.findByPk(id);
  if (!field) return null;
  const allowed = [
    'fieldLabel',
    'fieldType',
    'fieldSelector',
    'detectedValue',
    'filledValue',
    'confidence',
    'requiresReview',
    'status',
    'retryCount',
    'errorMessage',
  ];
  const patch = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  );
  return field.update(patch);
};

module.exports = { findById, findByStep, create, update };
