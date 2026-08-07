'use strict';

const { FieldMapping } = require('../../database');

const findByFieldId = async (fieldId) => {
  return FieldMapping.findOne({ where: { fieldId } });
};

const findById = async (id) => {
  return FieldMapping.findByPk(id);
};

const create = async (data) => {
  return FieldMapping.create(data);
};

const update = async (id, data) => {
  const mapping = await FieldMapping.findByPk(id);
  if (!mapping) return null;
  const allowed = [
    'resumeField',
    'mappedValue',
    'mappingMethod',
    'confidence',
    'reason',
    'mappingStatus',
    'overrideValue',
    'overriddenBy',
    'isVerified',
    'retryCount',
  ];
  const patch = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  );
  return mapping.update(patch);
};

/**
 * Upsert: create if no record for fieldId, else update existing.
 * Returns { mapping, created: boolean }.
 */
const upsertByFieldId = async (fieldId, data) => {
  const existing = await findByFieldId(fieldId);
  if (existing) {
    // On remap: clear override columns so AI result is fresh; increment retryCount.
    const updated = await update(existing.id, {
      ...data,
      overrideValue: null,
      overriddenBy: null,
      isVerified: false,
      retryCount: (existing.retryCount ?? 0) + 1,
    });
    return { mapping: updated, created: false };
  }
  const mapping = await create({ fieldId, ...data });
  return { mapping, created: true };
};

module.exports = { findById, findByFieldId, create, update, upsertByFieldId };
