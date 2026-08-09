'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ResumeEducations', {
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
      institution: { type: Sequelize.STRING(255), allowNull: true },
      degree: { type: Sequelize.STRING(255), allowNull: true },
      fieldOfStudy: { type: Sequelize.STRING(255), allowNull: true },
      startDate: { type: Sequelize.DATEONLY, allowNull: true },
      endDate: { type: Sequelize.DATEONLY, allowNull: true },
      gpa: { type: Sequelize.DECIMAL(4, 2), allowNull: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('ResumeEducations', ['resumeId', 'sortOrder'], {
      name: 'resume_educations_resumeId_sortOrder_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ResumeEducations');
  },
};