'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. Drop the old unique constraint (label + type) ─────────────────────
    // The table will now hold per-field records keyed by fieldId
    await queryInterface.removeIndex('FieldMappings', 'field_mappings_label_type_unique');

    // ── 2. Add per-field FK ───────────────────────────────────────────────────
    await queryInterface.addColumn('FieldMappings', 'fieldId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'ApplicationFields', key: 'id' },
      onDelete: 'CASCADE',
    });

    // ── 3. Add mapping result columns ─────────────────────────────────────────
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

    // ── 4. Add user-override columns ──────────────────────────────────────────
    await queryInterface.addColumn('FieldMappings', 'overrideValue', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('FieldMappings', 'overriddenBy', {
      type: Sequelize.UUID,
      allowNull: true,
      // References Users but no FK constraint — user table may not exist at fill time
    });

    // ── 5. Unique filtered index: one mapping per ApplicationField ────────────
    // MSSQL filtered unique index (only enforced when fieldId is NOT NULL)
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX [field_mappings_field_id_unique] ON [FieldMappings]([fieldId]) WHERE [fieldId] IS NOT NULL'
    );
  },

  async down(queryInterface, Sequelize) {
    // Drop filtered unique index
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

    // Restore original unique constraint
    await queryInterface.addIndex('FieldMappings', ['fieldLabel', 'fieldType'], {
      unique: true,
      name: 'field_mappings_label_type_unique',
    });
  },
};
