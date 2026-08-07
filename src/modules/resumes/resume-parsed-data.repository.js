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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise partial dates (YYYY or YYYY-MM) to YYYY-MM-DD so MSSQL DATEONLY
 * columns accept them without errors.
 */
const toDateOnly = (v) => {
  if (!v || typeof v !== 'string') return null;
  if (/^\d{4}$/.test(v)) return `${v}-01-01`;
  if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null; // reject anything else
};

/**
 * Deduplicate skills by lower-cased trimmed name.
 * First occurrence wins (preserves AI ordering).
 *
 * @param {{ skillName: string, category?: string }[]} skills
 */
const deduplicateSkills = (skills) => {
  const seen = new Set();
  return skills.filter((s) => {
    const key = s.skillName.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Persist all AI-parsed data for a resume in a single Sequelize transaction.
 *
 * - Deletes existing sub-table rows first (idempotent / re-parse safe).
 * - Updates Resume.parsedAt and Resume.parserVersion within the same transaction.
 * - Rolls back everything on any error.
 *
 * Column mapping (AI field → model field):
 *   contactInfo.location    → address
 *   contactInfo.linkedinUrl → linkedIn
 *   contactInfo.portfolioUrl / .website → website
 *   workExperience.jobTitle → title
 *   skills.skillName        → name
 *   certifications.expiryDate → expirationDate
 *
 * @param {string} resumeId
 * @param {{ contactInfo, workExperience, education, skills, certifications }} parsedData
 * @param {string} parserVersion  e.g. '1.0.0'
 */
const saveParsedResumeData = async (resumeId, parsedData, parserVersion) => {
  const {
    contactInfo,
    workExperience = [],
    education = [],
    skills = [],
    certifications = [],
  } = parsedData;

  await sequelize.transaction(async (t) => {
    // ── 1. Delete existing parsed rows (idempotent) ───────────────────────
    await Promise.all([
      ResumeContactInfo.destroy({ where: { resumeId }, transaction: t }),
      ResumeExperience.destroy({ where: { resumeId }, transaction: t }),
      ResumeEducation.destroy({ where: { resumeId }, transaction: t }),
      ResumeSkill.destroy({ where: { resumeId }, transaction: t }),
      ResumeCertification.destroy({ where: { resumeId }, transaction: t }),
    ]);

    // ── 2. Update Resume stamp ────────────────────────────────────────────
    await Resume.update(
      { parsedAt: new Date(), parserVersion: parserVersion || null },
      { where: { id: resumeId }, transaction: t }
    );

    // ── 3. Contact info ───────────────────────────────────────────────────
    await ResumeContactInfo.create(
      {
        id: uuidv4(),
        resumeId,
        fullName: contactInfo.fullName,
        email: contactInfo.email || null,
        phone: contactInfo.phone || null,
        address: contactInfo.location || null, // AI "location" → "address"
        linkedIn: contactInfo.linkedinUrl || null, // AI "linkedinUrl" → "linkedIn"
        website: contactInfo.portfolioUrl || contactInfo.website || null,
      },
      { transaction: t }
    );

    // ── 4. Work experience ────────────────────────────────────────────────
    if (workExperience.length > 0) {
      await ResumeExperience.bulkCreate(
        workExperience.map((exp, idx) => ({
          id: uuidv4(),
          resumeId,
          title: exp.jobTitle, // AI "jobTitle" → "title"
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

    // ── 5. Education ──────────────────────────────────────────────────────
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
            gpa: Number.isFinite(gpaRaw) && gpaRaw >= 0 ? gpaRaw : null, // DECIMAL(4,2)
            sortOrder: idx,
          };
        }),
        { transaction: t }
      );
    }

    // ── 6. Skills (deduped by case-insensitive name) ──────────────────────
    const uniqueSkills = deduplicateSkills(skills);
    if (uniqueSkills.length > 0) {
      await ResumeSkill.bulkCreate(
        uniqueSkills.map((skill, idx) => ({
          id: uuidv4(),
          resumeId,
          name: skill.skillName, // AI "skillName" → "name"
          category: skill.category || null,
          sortOrder: idx,
        })),
        { transaction: t }
      );
    }

    // ── 7. Certifications ─────────────────────────────────────────────────
    if (certifications.length > 0) {
      await ResumeCertification.bulkCreate(
        certifications.map((cert, idx) => ({
          id: uuidv4(),
          resumeId,
          name: cert.name,
          issuer: cert.issuer || null,
          issueDate: toDateOnly(cert.issueDate),
          expirationDate: toDateOnly(cert.expiryDate), // AI "expiryDate" → "expirationDate"
          credentialId: cert.credentialId || null,
          sortOrder: idx,
        })),
        { transaction: t }
      );
    }
  });
};

module.exports = { saveParsedResumeData };
