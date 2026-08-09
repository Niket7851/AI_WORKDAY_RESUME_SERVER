'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      resumeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Resumes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      jobTitle: { type: Sequelize.STRING(500), allowNull: true },
      company: { type: Sequelize.STRING(255), allowNull: true },
      jobUrl: { type: Sequelize.STRING(2000), allowNull: true },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'in_progress',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('Applications', ['userId'], { name: 'applications_userId_idx' });
    await queryInterface.addIndex('Applications', ['resumeId'], {
      name: 'applications_resumeId_idx',
    });
    await queryInterface.addIndex('Applications', ['status'], { name: 'applications_status_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Applications');
  },
};