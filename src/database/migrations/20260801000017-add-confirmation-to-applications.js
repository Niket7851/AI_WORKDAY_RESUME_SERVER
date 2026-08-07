'use strict';

/**
 * Adds user confirmation tracking columns to Applications.
 *
 * user_confirmed_at  — timestamp when the user explicitly confirmed submission.
 * confirmed_by       — userId (or free-text identifier) of who confirmed.
 *
 * These columns are set by POST /api/v1/applications/:id/confirm.
 * The backend records the confirmation BEFORE the extension is permitted
 * to trigger final Workday form submission, satisfying the requirement that
 * submission is never automatic.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Applications', 'userConfirmedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: 'status',
    });
    await queryInterface.addColumn('Applications', 'confirmedBy', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      after: 'userConfirmedAt',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Applications', 'userConfirmedAt');
    await queryInterface.removeColumn('Applications', 'confirmedBy');
  },
};
