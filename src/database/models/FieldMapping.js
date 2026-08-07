'use strict';

const { DataTypes } = require('sequelize');

const MAPPING_METHODS = ['ai', 'override'];
const MAPPING_STATUSES = ['mapped', 'uncertain', 'unmapped', 'overridden'];

/**
 * FieldMapping — per-field AI mapping result.
 *
 * Each ApplicationField can have one FieldMapping record that stores the AI's
 * mapping decision and any user override.  The table also acts as a reusable
 * label→path cache for future applications (fieldId can be NULL for global
 * cache entries).
 */
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
      // FK to the specific ApplicationField (nullable for global cache entries)
      fieldId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'ApplicationFields', key: 'id' },
        onDelete: 'CASCADE',
      },
      // Workday form label text, e.g. "First Name"
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
      // Dot-notation path into the structured resume — e.g. "contact.fullName"
      resumeField: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // Actual value extracted from the resume for this field
      mappedValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // How the mapping was produced: 'ai' | 'override'
      mappingMethod: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'ai',
        validate: { isIn: [MAPPING_METHODS] },
      },
      // 0.0 – 1.0
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: 0, max: 1 },
      },
      // AI's plain-language explanation for the mapping decision
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Overall mapping outcome
      mappingStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'mapped',
        validate: { isIn: [MAPPING_STATUSES] },
      },
      // User-supplied override value (kept separate from AI mappedValue)
      overrideValue: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // UUID of the user who applied the override
      overriddenBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      // True when the user has confirmed this mapping is correct
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // How many times the AI has been asked to map this field (incremented on remap).
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
        // Non-unique label+type index (for global cache lookups)
        { fields: ['fieldLabel', 'fieldType'] },
        { fields: ['isVerified'] },
        { fields: ['mappingStatus'] },
        // Unique per-field index enforced in DB via filtered index (migration 16)
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
