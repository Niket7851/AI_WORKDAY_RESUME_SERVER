'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Resumes', 'storedFileName', {
      type: Sequelize.STRING(500),
      allowNull: true, // nullable for existing rows; set NOT NULL after backfill if needed
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Resumes', 'storedFileName');
  },
};
