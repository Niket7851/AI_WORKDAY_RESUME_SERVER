'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Resumes', 'storedFileName', {
      type: Sequelize.STRING(500),
      allowNull: true, 
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Resumes', 'storedFileName');
  },
};