'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ApplicationSteps', {
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
      stepName: { type: Sequelize.STRING(255), allowNull: false },
      stepIndex: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pending' },
      completedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('ApplicationSteps', ['applicationId', 'stepIndex'], {
      name: 'application_steps_applicationId_stepIndex_idx',
    });
    await queryInterface.addIndex('ApplicationSteps', ['status'], {
      name: 'application_steps_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ApplicationSteps');
  },
};