'use strict';

const { DataTypes } = require('sequelize');

const defineResume = (sequelize) => {
  const Resume = sequelize.define(
    'Resume',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      originalFileName: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: { len: [1, 500] },
      },
      fileType: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: { isIn: [['pdf', 'docx']] },
      },
      // Raw extracted text — never logged, never sent to the extension
      rawText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // UUID-based filename of the stored file on disk (e.g. "a1b2c3d4-....pdf")
      storedFileName: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      parsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Semver string identifying the AI prompt+schema version used for parsing
      parserVersion: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: 'Resumes',
      timestamps: true,
      indexes: [{ fields: ['userId'] }],
    }
  );

  return Resume;
};

module.exports = defineResume;
