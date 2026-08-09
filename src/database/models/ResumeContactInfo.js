'use strict';

const { DataTypes } = require('sequelize');

const defineResumeContactInfo = (sequelize) => {
  const ResumeContactInfo = sequelize.define(
    'ResumeContactInfo',
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
        unique: true, 
        references: { model: 'Resumes', key: 'id' },
        onDelete: 'CASCADE',
      },
      fullName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      zipCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      linkedIn: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: 'ResumeContactInfos',
      timestamps: true,
      indexes: [{ unique: true, fields: ['resumeId'] }],
    }
  );

  return ResumeContactInfo;
};

module.exports = defineResumeContactInfo;