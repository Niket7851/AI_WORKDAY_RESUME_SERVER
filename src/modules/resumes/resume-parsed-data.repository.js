'use strict';

const { v4: uuidv4 } = require('uuid');
const {
  sequelize,
  Resume,
  ResumeContactInfo,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeCertification,
} = require('../../database');

const toDateOnly = (v) => {
  if (!v || typeof v !== 'string') return null;
  if (/^\d{4}$/.test(v)) return `${v}-01-01`;
  if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null; 
};

const deduplicateSkills = (skills) => {
  const seen = new Set();
  return skills.filter((s) => {
    const key = s.skillName.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const saveParsedResumeData = async (resumeId, parsedData, parserVersion) => {
  const {
    contactInfo,
    workExperience = [],
    education = [],
    skills = [],
    certifications = [],
  } = parsedData;

  await sequelize.transaction(async (t) => {

    await Promise.all([
      ResumeContactInfo.destroy({ where: { resumeId }, transaction: t }),
      ResumeExperience.destroy({ where: { resumeId }, transaction: t }),
      ResumeEducation.destroy({ where: { resumeId }, transaction: t }),
      ResumeSkill.destroy({ where: { resumeId }, transaction: t }),
      ResumeCertification.destroy({ where: { resumeId }, transaction: t }),
    ]);

    await Resume.update(
      { parsedAt: new Date(), parserVersion: parserVersion || null },
      { where: { id: resumeId }, transaction: t }
    );

    await ResumeContactInfo.create(
      {
        id: uuidv4(),
        resumeId,
        fullName: contactInfo.fullName,
        email: contactInfo.email || null,
        phone: contactInfo.phone || null,
        address: contactInfo.location || null, 
        linkedIn: contactInfo.linkedinUrl || null, 
        website: contactInfo.portfolioUrl || contactInfo.website || null,
      },
      { transaction: t }
    );

    if (workExperience.length > 0) {
      await ResumeExperience.bulkCreate(
        workExperience.map((exp, idx) => ({
          id: uuidv4(),
          resumeId,
          title: exp.jobTitle, 
          company: exp.company,
          location: exp.location || null,
          startDate: toDateOnly(exp.startDate),
          endDate: exp.isCurrent ? null : toDateOnly(exp.endDate),
          isCurrent: exp.isCurrent ?? false,
          description: exp.description || null,
          sortOrder: idx,
        })),
        { transaction: t }
      );
    }

    if (education.length > 0) {
      await ResumeEducation.bulkCreate(
        education.map((edu, idx) => {
          const gpaRaw = edu.gpa ? parseFloat(edu.gpa) : null;
          return {
            id: uuidv4(),
            resumeId,
            degree: edu.degree || null,
            institution: edu.institution,
            startDate: toDateOnly(edu.startDate),
            endDate: toDateOnly(edu.endDate),
            gpa: Number.isFinite(gpaRaw) && gpaRaw >= 0 ? gpaRaw : null, 
            sortOrder: idx,
          };
        }),
        { transaction: t }
      );
    }

    const uniqueSkills = deduplicateSkills(skills);
    if (uniqueSkills.length > 0) {
      await ResumeSkill.bulkCreate(
        uniqueSkills.map((skill, idx) => ({
          id: uuidv4(),
          resumeId,
          name: skill.skillName, 
          category: skill.category || null,
          sortOrder: idx,
        })),
        { transaction: t }
      );
    }

    if (certifications.length > 0) {
      await ResumeCertification.bulkCreate(
        certifications.map((cert, idx) => ({
          id: uuidv4(),
          resumeId,
          name: cert.name,
          issuer: cert.issuer || null,
          issueDate: toDateOnly(cert.issueDate),
          expirationDate: toDateOnly(cert.expiryDate), 
          credentialId: cert.credentialId || null,
          sortOrder: idx,
        })),
        { transaction: t }
      );
    }
  });
};

module.exports = { saveParsedResumeData };