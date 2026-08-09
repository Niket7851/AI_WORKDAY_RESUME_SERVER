'use strict';

const { Application, ApplicationStep, ApplicationField } = require('../../database');

const STEPS_WITH_FIELDS = {
  model: ApplicationStep,
  as: 'steps',
  order: [['stepIndex', 'ASC']],
  include: [{ model: ApplicationField, as: 'fields' }],
};

const findAll = async ({ userId } = {}) => {
  const where = userId ? { userId } : {};
  return Application.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });
};

const findById = async (id) => {
  return Application.findByPk(id);
};

const findByIdWithDetails = async (id) => {
  return Application.findByPk(id, { include: [STEPS_WITH_FIELDS] });
};

const create = async ({ userId, resumeId, jobTitle, company, jobUrl }) => {
  return Application.create({ userId, resumeId, jobTitle, company, jobUrl });
};

const update = async (id, data) => {
  const app = await Application.findByPk(id);
  if (!app) return null;

  const allowed = ['jobTitle', 'company', 'jobUrl', 'status', 'userConfirmedAt', 'confirmedBy'];
  const patch = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  );
  return app.update(patch);
};

module.exports = { findAll, findById, findByIdWithDetails, create, update };