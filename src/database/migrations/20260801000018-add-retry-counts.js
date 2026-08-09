'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('FieldMappings', 'retryCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'mappingStatus',
    });

    await queryInterface.addColumn('AutomationRuns', 'retryCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'status',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('FieldMappings', 'retryCount');
    await queryInterface.removeColumn('AutomationRuns', 'retryCount');
  },
};