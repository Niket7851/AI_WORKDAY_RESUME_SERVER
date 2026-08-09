'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config');
const defineAssociations = require('./associations');

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

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mssql',
  logging: config.env === 'development' ? console.log : false, 
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

async function verifyConnection() {
  await sequelize.authenticate();
}

sequelize.connectionManager.pool?.on?.('error', (err) => {

  console.error('[DB] Connection pool error (pool will reconnect):', err.message);
});

module.exports = {
  sequelize,
  verifyConnection,

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