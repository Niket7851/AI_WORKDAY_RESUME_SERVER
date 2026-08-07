'use strict';

/**
 * Defines all Sequelize model associations in one place.
 * Called once during application startup after all models are initialised.
 *
 * Relationship summary:
 *   User          has many  Resume
 *   User          has many  Application
 *   Resume        belongs to User
 *   Resume        has one   ResumeContactInfo
 *   Resume        has many  ResumeExperience
 *   Resume        has many  ResumeEducation
 *   Resume        has many  ResumeSkill
 *   Resume        has many  ResumeCertification
 *   Resume        has many  Application
 *   Application   belongs to User
 *   Application   belongs to Resume
 *   Application   has many  ApplicationStep
 *   Application   has many  AutomationRun
 *   ApplicationStep  belongs to Application
 *   ApplicationStep  has many ApplicationField
 *   ApplicationField belongs to ApplicationStep
 *   FieldMapping  — standalone lookup table (no FK associations)
 *   AutomationRun belongs to Application
 */
function defineAssociations(models) {
  const {
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
    AutomationRun,
  } = models;

  // ── User ↔ Resume ──────────────────────────────────────────────────────────
  User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes', onDelete: 'CASCADE' });
  Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // ── Resume → resume detail tables ─────────────────────────────────────────
  Resume.hasOne(ResumeContactInfo, {
    foreignKey: 'resumeId',
    as: 'contactInfo',
    onDelete: 'CASCADE',
  });
  ResumeContactInfo.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeExperience, {
    foreignKey: 'resumeId',
    as: 'experiences',
    onDelete: 'CASCADE',
  });
  ResumeExperience.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeEducation, {
    foreignKey: 'resumeId',
    as: 'educations',
    onDelete: 'CASCADE',
  });
  ResumeEducation.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeSkill, {
    foreignKey: 'resumeId',
    as: 'skills',
    onDelete: 'CASCADE',
  });
  ResumeSkill.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  Resume.hasMany(ResumeCertification, {
    foreignKey: 'resumeId',
    as: 'certifications',
    onDelete: 'CASCADE',
  });
  ResumeCertification.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  // ── User ↔ Application ────────────────────────────────────────────────────
  User.hasMany(Application, { foreignKey: 'userId', as: 'applications', onDelete: 'CASCADE' });
  Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // ── Resume ↔ Application ──────────────────────────────────────────────────
  Resume.hasMany(Application, { foreignKey: 'resumeId', as: 'applications' });
  Application.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

  // ── Application → ApplicationStep → ApplicationField ──────────────────────
  Application.hasMany(ApplicationStep, {
    foreignKey: 'applicationId',
    as: 'steps',
    onDelete: 'CASCADE',
  });
  ApplicationStep.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

  ApplicationStep.hasMany(ApplicationField, {
    foreignKey: 'stepId',
    as: 'fields',
    onDelete: 'CASCADE',
  });
  ApplicationField.belongsTo(ApplicationStep, { foreignKey: 'stepId', as: 'step' });

  // ── Application → AutomationRun ───────────────────────────────────────────
  Application.hasMany(AutomationRun, {
    foreignKey: 'applicationId',
    as: 'automationRuns',
    onDelete: 'CASCADE',
  });
  AutomationRun.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
}

module.exports = defineAssociations;
