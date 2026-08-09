'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Resumes', {
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
      originalFileName: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      fileType: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      rawText: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      parsedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('Resumes', ['userId'], { name: 'resumes_userId_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Resumes');
  },
};