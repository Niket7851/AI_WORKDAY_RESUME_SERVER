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

      rawText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      storedFileName: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      parsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

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