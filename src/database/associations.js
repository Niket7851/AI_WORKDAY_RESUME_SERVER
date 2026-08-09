'use strict';

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

  User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes', onDelete: 'CASCADE' });
  Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });

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

  User.hasMany(Application, { foreignKey: 'userId', as: 'applications', onDelete: 'CASCADE' });
  Application.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Resume.hasMany(Application, { foreignKey: 'resumeId', as: 'applications' });
  Application.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

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

  Application.hasMany(AutomationRun, {
    foreignKey: 'applicationId',
    as: 'automationRuns',
    onDelete: 'CASCADE',
  });
  AutomationRun.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
}

module.exports = defineAssociations;