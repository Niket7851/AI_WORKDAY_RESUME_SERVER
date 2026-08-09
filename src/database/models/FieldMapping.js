'use strict';

const { DataTypes } = require('sequelize');

const MAPPING_METHODS = ['ai', 'override'];
const MAPPING_STATUSES = ['mapped', 'uncertain', 'unmapped', 'overridden'];

const defineFieldMapping = (sequelize) => {
  const FieldMapping = sequelize.define(
    'FieldMapping',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      fieldId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'ApplicationFields', key: 'id' },
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
      },

      resumeField: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      mappedValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      mappingMethod: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'ai',
        validate: { isIn: [MAPPING_METHODS] },
      },

      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0, max: 1 },
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      mappingStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'mapped',
        validate: { isIn: [MAPPING_STATUSES] },
      },

      overrideValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      overriddenBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'FieldMappings',
      timestamps: true,
      indexes: [

        { fields: ['fieldLabel', 'fieldType'] },
        { fields: ['isVerified'] },
        { fields: ['mappingStatus'] },

      ],
    }
  );

  FieldMapping.MAPPING_METHODS = Object.freeze({ AI: 'ai', OVERRIDE: 'override' });
  FieldMapping.STATUSES = Object.freeze({
    MAPPED: 'mapped',
    UNCERTAIN: 'uncertain',
    UNMAPPED: 'unmapped',
    OVERRIDDEN: 'overridden',
  });

  return FieldMapping;
};

module.exports = defineFieldMapping;