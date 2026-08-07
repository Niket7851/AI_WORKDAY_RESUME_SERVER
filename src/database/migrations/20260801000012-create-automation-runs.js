'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AutomationRuns', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      applicationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      startedAt: { type: Sequelize.DATE, allowNull: false },
      completedAt: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'running' },
      errorMessage: { type: Sequelize.TEXT, allowNull: true },
      // Non-sensitive metadata stored as JSON text
      metadata: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('AutomationRuns', ['applicationId'], {
      name: 'automation_runs_applicationId_idx',
    });
    await queryInterface.addIndex('AutomationRuns', ['status'], {
      name: 'automation_runs_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('AutomationRuns');
  },
};
