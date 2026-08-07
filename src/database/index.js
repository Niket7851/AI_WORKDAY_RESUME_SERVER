'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config');
const defineAssociations = require('./associations');

// ── Model factory imports ──────────────────────────────────────────────────────
const defineUser = require('./models/User');
const defineResume = require('./models/Resume');
const defineResumeContactInfo = require('./models/ResumeContactInfo');
const defineResumeExperience = require('./models/ResumeExperience');
const defineResumeEducation = require('./models/ResumeEducation');
const defineResumeSkill = require('./models/ResumeSkill');
const defineResumeCertification = require('./models/ResumeCertification');
const defineApplication = require('./models/Application');
const defineApplicationStep = require('./models/ApplicationStep');
const defineApplicationField = require('./models/ApplicationField');
const defineFieldMapping = require('./models/FieldMapping');
const defineAutomationRun = require('./models/AutomationRun');

// ── Sequelize instance ────────────────────────────────────────────────────────
const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mssql',
  logging: config.env === 'development' ? console.log : false, // eslint-disable-line no-console
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: config.env !== 'production',
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// ── Initialise models ─────────────────────────────────────────────────────────
const User = defineUser(sequelize);
const Resume = defineResume(sequelize);
const ResumeContactInfo = defineResumeContactInfo(sequelize);
const ResumeExperience = defineResumeExperience(sequelize);
const ResumeEducation = defineResumeEducation(sequelize);
const ResumeSkill = defineResumeSkill(sequelize);
const ResumeCertification = defineResumeCertification(sequelize);
const Application = defineApplication(sequelize);
const ApplicationStep = defineApplicationStep(sequelize);
const ApplicationField = defineApplicationField(sequelize);
const FieldMapping = defineFieldMapping(sequelize);
const AutomationRun = defineAutomationRun(sequelize);

// ── Define associations ───────────────────────────────────────────────────────
defineAssociations({
  User,
  Resume,
  ResumeContactInfo,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeCertification,
  Application,
  ApplicationStep,
  ApplicationField,
  FieldMapping,
  AutomationRun,
});

/**
 * Verify database connectivity. Call on server startup.
 * @returns {Promise<void>}
 */
async function verifyConnection() {
  await sequelize.authenticate();
}

// ── Pool error handler ────────────────────────────────────────────────────────
// Unhandled pool-level errors (e.g. unexpected socket closures) must not crash
// the process — log them and let the pool manager reconnect automatically.
sequelize.connectionManager.pool?.on?.('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[DB] Connection pool error (pool will reconnect):', err.message);
});

module.exports = {
  sequelize,
  verifyConnection,
  // Models — all consumers import from here, never directly from model files
  User,
  Resume,
  ResumeContactInfo,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeCertification,
  Application,
  ApplicationStep,
  ApplicationField,
  FieldMapping,
  AutomationRun,
};
