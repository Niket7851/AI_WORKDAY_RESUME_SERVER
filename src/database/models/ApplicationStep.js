'use strict';

const { DataTypes } = require('sequelize');

const STEP_STATUSES = ['pending', 'in_progress', 'completed', 'skipped'];

const defineApplicationStep = (sequelize) => {
  const ApplicationStep = sequelize.define(
    'ApplicationStep',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      applicationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Applications', key: 'id' },
        onDelete: 'CASCADE',
      },
      stepName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { len: [1, 255] },
      },
      stepIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: { isIn: [STEP_STATUSES] },
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'ApplicationSteps',
      timestamps: true,
      indexes: [{ fields: ['applicationId', 'stepIndex'] }, { fields: ['status'] }],
    }
  );

  ApplicationStep.STATUSES = Object.freeze({
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SKIPPED: 'skipped',
  });

  return ApplicationStep;
};

module.exports = defineApplicationStep;
