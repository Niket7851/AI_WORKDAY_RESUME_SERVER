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
      // CSS selector or XPath for the DOM element
      fieldSelector: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      // Value detected already in the field (must not be overwritten if valid)
      detectedValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Value the AI filled or proposed
      filledValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // 0.0 – 1.0
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0, max: 1 },
      },
      // Fields below confidence threshold or unmapped → user must review
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
      // How many times automation attempted to fill this field
      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // Last error message from a failed fill attempt
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
