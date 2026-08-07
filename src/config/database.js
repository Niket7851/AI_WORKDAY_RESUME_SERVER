'use strict';

/**
 * Sequelize CLI database configuration.
 * Reads all credentials from environment variables — never hard-code secrets.
 * This file is used by sequelize-cli (migrations, seeders) and referenced in .sequelizerc.
 */
require('dotenv').config();

const shared = {
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: process.env.NODE_ENV !== 'production',
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

module.exports = {
  development: {
    ...shared,
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_workday_dev',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    logging: console.log, // eslint-disable-line no-console
  },
  test: {
    ...shared,
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'ai_workday_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    logging: false,
  },
  production: {
    ...shared,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    logging: false,
  },
};
