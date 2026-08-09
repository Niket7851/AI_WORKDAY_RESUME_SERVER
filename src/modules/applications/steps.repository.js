'use strict';

const { ApplicationStep, ApplicationField } = require('../../database');

const findById = async (id) => {
  return ApplicationStep.findByPk(id);
};

const findByIdWithFields = async (id) => {
  return ApplicationStep.findByPk(id, {
    include: [{ model: ApplicationField, as: 'fields' }],
  });
};

const findByApplication = async (applicationId) => {
  return ApplicationStep.findAll({
    where: { applicationId },
    order: [['stepIndex', 'ASC']],
    include: [{ model: ApplicationField, as: 'fields' }],
  });
};

const findByIndex = async (applicationId, stepIndex, excludeId = null) => {
  const { Op } = require('sequelize');
  const where = { applicationId, stepIndex };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return ApplicationStep.findOne({ where });
};

const create = async ({ applicationId, stepName, stepIndex }) => {
  return ApplicationStep.create({ applicationId, stepName, stepIndex });
};

const update = async (id, data) => {
  const step = await ApplicationStep.findByPk(id);
  if (!step) return null;
  const allowed = ['stepName', 'stepIndex', 'status', 'completedAt'];
  const patch = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  );
  return step.update(patch);
};

module.exports = {
  findById,
  findByIdWithFields,
  findByApplication,
  findByIndex,
  create,
  update,
};