'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ResumeContactInfos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resumeId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'Resumes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fullName: { type: Sequelize.STRING(255), allowNull: true },
      email: { type: Sequelize.STRING(255), allowNull: true },
      phone: { type: Sequelize.STRING(50), allowNull: true },
      address: { type: Sequelize.STRING(500), allowNull: true },
      city: { type: Sequelize.STRING(100), allowNull: true },
      state: { type: Sequelize.STRING(100), allowNull: true },
      zipCode: { type: Sequelize.STRING(20), allowNull: true },
      country: { type: Sequelize.STRING(100), allowNull: true },
      linkedIn: { type: Sequelize.STRING(500), allowNull: true },
      website: { type: Sequelize.STRING(500), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('ResumeContactInfos', ['resumeId'], {
      unique: true,
      name: 'resume_contact_infos_resumeId_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ResumeContactInfos');
  },
};
