'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FieldMappings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fieldLabel: { type: Sequelize.STRING(500), allowNull: false },
      fieldType: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'text' },
      resumeField: { type: Sequelize.STRING(255), allowNull: true },
      confidence: { type: Sequelize.FLOAT, allowNull: true },
      isVerified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Unique constraint: one mapping per (fieldLabel, fieldType) pair
    await queryInterface.addIndex('FieldMappings', ['fieldLabel', 'fieldType'], {
      unique: true,
      name: 'field_mappings_label_type_unique',
    });
    await queryInterface.addIndex('FieldMappings', ['isVerified'], {
      name: 'field_mappings_isVerified_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('FieldMappings');
  },
};
