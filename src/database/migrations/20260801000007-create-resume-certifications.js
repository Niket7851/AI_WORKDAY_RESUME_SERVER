'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ResumeCertifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      resumeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Resumes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      issuer: { type: Sequelize.STRING(255), allowNull: true },
      issueDate: { type: Sequelize.DATEONLY, allowNull: true },
      expirationDate: { type: Sequelize.DATEONLY, allowNull: true },
      credentialId: { type: Sequelize.STRING(255), allowNull: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('ResumeCertifications', ['resumeId'], {
      name: 'resume_certifications_resumeId_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ResumeCertifications');
  },
};
