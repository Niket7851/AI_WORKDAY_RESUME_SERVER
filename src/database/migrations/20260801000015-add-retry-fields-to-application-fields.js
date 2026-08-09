'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ApplicationFields', 'retryCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('ApplicationFields', 'errorMessage', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('ApplicationFields', 'retryCount');
    await queryInterface.removeColumn('ApplicationFields', 'errorMessage');
  },
};