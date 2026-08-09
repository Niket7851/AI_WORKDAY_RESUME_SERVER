'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.removeIndex('FieldMappings', 'field_mappings_label_type_unique');

    await queryInterface.addColumn('FieldMappings', 'fieldId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'ApplicationFields', key: 'id' },
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('FieldMappings', 'mappedValue', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('FieldMappings', 'mappingMethod', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'ai',
    });
    await queryInterface.addColumn('FieldMappings', 'reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('FieldMappings', 'mappingStatus', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'mapped',
    });

    await queryInterface.addColumn('FieldMappings', 'overrideValue', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('FieldMappings', 'overriddenBy', {
      type: Sequelize.UUID,
      allowNull: true,

    });

    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX [field_mappings_field_id_unique] ON [FieldMappings]([fieldId]) WHERE [fieldId] IS NOT NULL'
    );
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(
      'DROP INDEX [field_mappings_field_id_unique] ON [FieldMappings]'
    );

    await queryInterface.removeColumn('FieldMappings', 'overriddenBy');
    await queryInterface.removeColumn('FieldMappings', 'overrideValue');
    await queryInterface.removeColumn('FieldMappings', 'mappingStatus');
    await queryInterface.removeColumn('FieldMappings', 'reason');
    await queryInterface.removeColumn('FieldMappings', 'mappingMethod');
    await queryInterface.removeColumn('FieldMappings', 'mappedValue');
    await queryInterface.removeColumn('FieldMappings', 'fieldId');

    await queryInterface.addIndex('FieldMappings', ['fieldLabel', 'fieldType'], {
      unique: true,
      name: 'field_mappings_label_type_unique',
    });
  },
};