'use strict';

const { DataTypes } = require('sequelize');

const defineResumeEducation = (sequelize) => {
  const ResumeEducation = sequelize.define(
    'ResumeEducation',
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
      institution: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      degree: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fieldOfStudy: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gpa: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'ResumeEducations',
      timestamps: true,
      indexes: [{ fields: ['resumeId', 'sortOrder'] }],
    }
  );

  return ResumeEducation;
};

module.exports = defineResumeEducation;