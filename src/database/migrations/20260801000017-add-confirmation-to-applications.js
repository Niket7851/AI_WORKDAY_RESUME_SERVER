'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Applications', 'userConfirmedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: 'status',
    });
    await queryInterface.addColumn('Applications', 'confirmedBy', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      after: 'userConfirmedAt',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Applications', 'userConfirmedAt');
    await queryInterface.removeColumn('Applications', 'confirmedBy');
  },
};