'use strict';

/**
 * Adds retry tracking to FieldMappings so we know how many times a field
 * has been sent to the AI for mapping.  Helps detect chronic mapping failures
 * and surfaces them for user review.
 *
 * Also adds retryCount to AutomationRuns to track step-level retries.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Per-field AI mapping retry counter
    await queryInterface.addColumn('FieldMappings', 'retryCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'mappingStatus',
    });

    // Per-automation-run retry counter (step-level retries)
    await queryInterface.addColumn('AutomationRuns', 'retryCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'status',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('FieldMappings', 'retryCount');
    await queryInterface.removeColumn('AutomationRuns', 'retryCount');
  },
};
