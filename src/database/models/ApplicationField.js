'use strict';

const { DataTypes } = require('sequelize');

const FIELD_TYPES = ['text', 'select', 'textarea', 'checkbox', 'radio', 'date', 'file'];
const FIELD_STATUSES = ['pending', 'filled', 'skipped', 'error'];

const defineApplicationField = (sequelize) => {
  const ApplicationField = sequelize.define(
    'ApplicationField',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      stepId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ApplicationSteps', key: 'id' },
        onDelete: 'CASCADE',
      },
      fieldLabel: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: { len: [1, 500] },
      },
      fieldType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'text',
        validate: { isIn: [FIELD_TYPES] },
      },

      fieldSelector: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },

      detectedValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      filledValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0, max: 1 },
      },

      requiresReview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: { isIn: [FIELD_STATUSES] },
      },

      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'ApplicationFields',
      timestamps: true,
      indexes: [{ fields: ['stepId'] }, { fields: ['requiresReview'] }, { fields: ['status'] }],
    }
  );

  ApplicationField.FIELD_TYPES = Object.freeze(
    Object.fromEntries(FIELD_TYPES.map((t) => [t.toUpperCase(), t]))
  );
  ApplicationField.STATUSES = Object.freeze({
    PENDING: 'pending',
    FILLED: 'filled',
    SKIPPED: 'skipped',
    ERROR: 'error',
  });

  return ApplicationField;
};

module.exports = defineApplicationField;