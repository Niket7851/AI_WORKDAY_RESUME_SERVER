'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ApplicationFields', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      stepId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ApplicationSteps', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fieldLabel: { type: Sequelize.STRING(500), allowNull: false },
      fieldType: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'text' },
      fieldSelector: { type: Sequelize.STRING(1000), allowNull: true },
      detectedValue: { type: Sequelize.TEXT, allowNull: true },
      filledValue: { type: Sequelize.TEXT, allowNull: true },
      confidence: { type: Sequelize.FLOAT, allowNull: true },
      requiresReview: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pending' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('ApplicationFields', ['stepId'], {
      name: 'application_fields_stepId_idx',
    });
    await queryInterface.addIndex('ApplicationFields', ['requiresReview'], {
      name: 'application_fields_requiresReview_idx',
    });
    await queryInterface.addIndex('ApplicationFields', ['status'], {
      name: 'application_fields_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ApplicationFields');
  },
};
