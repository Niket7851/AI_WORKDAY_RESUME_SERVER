'use strict';

const { DataTypes } = require('sequelize');

const defineResumeExperience = (sequelize) => {
  const ResumeExperience = sequelize.define(
    'ResumeExperience',
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
      company: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      location: {
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
      isCurrent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'ResumeExperiences',
      timestamps: true,
      indexes: [{ fields: ['resumeId', 'sortOrder'] }],
    }
  );

  return ResumeExperience;
};

module.exports = defineResumeExperience;
