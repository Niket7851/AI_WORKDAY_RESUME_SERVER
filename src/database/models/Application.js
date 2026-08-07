'use strict';

const { DataTypes } = require('sequelize');

const APPLICATION_STATUSES = ['in_progress', 'completed', 'cancelled'];

const defineApplication = (sequelize) => {
  const Application = sequelize.define(
    'Application',
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
      resumeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Resumes', key: 'id' },
        onDelete: 'NO ACTION',
      },
      jobTitle: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      jobUrl: {
        type: DataTypes.STRING(2000),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'in_progress',
        validate: { isIn: [APPLICATION_STATUSES] },
      },
      userConfirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      confirmedBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'Applications',
      timestamps: true,
      indexes: [{ fields: ['userId'] }, { fields: ['resumeId'] }, { fields: ['status'] }],
    }
  );

  Application.STATUSES = Object.freeze({
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  });

  return Application;
};

module.exports = defineApplication;
