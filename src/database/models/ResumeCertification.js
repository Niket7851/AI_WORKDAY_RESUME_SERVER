'use strict';

const { DataTypes } = require('sequelize');

const defineResumeCertification = (sequelize) => {
  const ResumeCertification = sequelize.define(
    'ResumeCertification',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resumeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Resumes', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { len: [1, 255] },
      },
      issuer: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      expirationDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      credentialId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'ResumeCertifications',
      timestamps: true,
      indexes: [{ fields: ['resumeId'] }],
    }
  );

  return ResumeCertification;
};

module.exports = defineResumeCertification;