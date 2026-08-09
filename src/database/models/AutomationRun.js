'use strict';

const { DataTypes } = require('sequelize');

const RUN_STATUSES = ['running', 'completed', 'failed', 'cancelled'];

const defineAutomationRun = (sequelize) => {
  const AutomationRun = sequelize.define(
    'AutomationRun',
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
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'running',
        validate: { isIn: [RUN_STATUSES] },
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const raw = this.getDataValue('metadata');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        },
        set(value) {
          this.setDataValue('metadata', value != null ? JSON.stringify(value) : null);
        },
      },
    },
    {
      tableName: 'AutomationRuns',
      timestamps: true,
      indexes: [{ fields: ['applicationId'] }, { fields: ['status'] }],
    }
  );

  AutomationRun.STATUSES = Object.freeze({
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  });

  return AutomationRun;
};

module.exports = defineAutomationRun;