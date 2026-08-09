'use strict';

const createGeminiProvider = require('./providers/gemini.provider');
const { buildResumeParserPrompt, RESUME_PARSE_SCHEMA } = require('./prompts/resume-parser.prompt');
const { buildFieldMapperPrompt, FIELD_MAPPER_SCHEMA } = require('./prompts/field-mapper.prompt');

const logger = {
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'warn', msg, ...meta })), 
  error: (msg, meta = {}) => console.error(JSON.stringify({ level: 'error', msg, ...meta })), 
};

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const sanitizeString = (v, maxLen = 1000) => {
  if (!isNonEmptyString(v)) return null;
  return v.trim().slice(0, maxLen);
};

const sanitizeUrl = (v) => {
  if (!isNonEmptyString(v)) return null;
  const trimmed = v.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return null;
  return trimmed.slice(0, 2048);
};

const sanitizeDate = (v) => {
  if (!isNonEmptyString(v)) return null;
  const trimmed = v.trim();

  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(trimmed)) return null;
  return trimmed;
};

const validateContactInfo = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const contact = {};

  const fullName = sanitizeString(raw.fullName, 200);
  contact.fullName = fullName || 'Unknown';

  const optionalStrings = ['email', 'phone', 'location'];
  optionalStrings.forEach((key) => {
    const val = sanitizeString(raw[key], 200);
    if (val) contact[key] = val;
  });

  const urlFields = ['linkedinUrl', 'githubUrl', 'portfolioUrl', 'website'];
  urlFields.forEach((key) => {
    const val = sanitizeUrl(raw[key]);
    if (val) contact[key] = val;
  });

  return contact;
};

const validateWorkExperience = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const jobTitle = sanitizeString(item.jobTitle, 200);
      const company = sanitizeString(item.company, 200);
      if (!jobTitle || !company) return null;

      const entry = { jobTitle, company };
      const optStr = sanitizeString(item.location, 200);
      if (optStr) entry.location = optStr;
      const desc = sanitizeString(item.description, 5000);
      if (desc) entry.description = desc;
      const startDate = sanitizeDate(item.startDate);
      if (startDate) entry.startDate = startDate;
      const endDate = sanitizeDate(item.endDate);
      if (endDate) entry.endDate = endDate;
      entry.isCurrent = item.isCurrent === 'true' || item.isCurrent === true;

      return entry;
    })
    .filter(Boolean);
};

const validateEducation = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const institution = sanitizeString(item.institution, 300);
      if (!institution) return null;

      const entry = { institution };
      const degree = sanitizeString(item.degree, 300);
      if (degree) entry.degree = degree;
      const loc = sanitizeString(item.location, 200);
      if (loc) entry.location = loc;
      const desc = sanitizeString(item.description, 2000);
      if (desc) entry.description = desc;
      const gpa = sanitizeString(item.gpa, 20);
      if (gpa) entry.gpa = gpa;
      const startDate = sanitizeDate(item.startDate);
      if (startDate) entry.startDate = startDate;
      const endDate = sanitizeDate(item.endDate);
      if (endDate) entry.endDate = endDate;

      return entry;
    })
    .filter(Boolean);
};

const VALID_SKILL_LEVELS = new Set(['Beginner', 'Intermediate', 'Advanced', 'Expert']);

const validateSkills = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const skillName = sanitizeString(item.skillName, 200);
      if (!skillName) return null;

      const entry = { skillName };
      const category = sanitizeString(item.category, 100);
      if (category) entry.category = category;
      const level = sanitizeString(item.level, 50);
      if (level && VALID_SKILL_LEVELS.has(level)) entry.level = level;

      return entry;
    })
    .filter(Boolean);
};

const validateCertifications = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = sanitizeString(item.name, 300);
      if (!name) return null;

      const entry = { name };
      const issuer = sanitizeString(item.issuer, 300);
      if (issuer) entry.issuer = issuer;
      const credId = sanitizeString(item.credentialId, 200);
      if (credId) entry.credentialId = credId;
      const url = sanitizeUrl(item.url);
      if (url) entry.url = url;
      const issueDate = sanitizeDate(item.issueDate);
      if (issueDate) entry.issueDate = issueDate;
      const expiryDate = sanitizeDate(item.expiryDate);
      if (expiryDate) entry.expiryDate = expiryDate;

      return entry;
    })
    .filter(Boolean);
};

const validateAndNormalizeAiOutput = (raw) => {
  const contactInfo = validateContactInfo(raw.contactInfo);
  if (!contactInfo) {
    throw new Error('AI output missing required contactInfo.fullName');
  }
  return {
    contactInfo,
    workExperience: validateWorkExperience(raw.workExperience),
    education: validateEducation(raw.education),
    skills: validateSkills(raw.skills),
    certifications: validateCertifications(raw.certifications),
  };
};

const createAiService = (provider = null) => {

  const resolvedProvider = provider || createGeminiProvider();

  const parseResume = async (rawText) => {
    if (!isNonEmptyString(rawText)) {
      throw new Error('rawText must be a non-empty string');
    }

    const prompt = buildResumeParserPrompt(rawText);

    let rawResponseText;
    try {
      rawResponseText = await resolvedProvider.generateContent(prompt, {
        responseMimeType: 'application/json',
        responseSchema: RESUME_PARSE_SCHEMA,
      });
    } catch (err) {

      logger.error('AI provider error during resume parsing', { code: err.code });
      throw err;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawResponseText);
    } catch {
      logger.error('AI returned invalid JSON');
      const jsonErr = new Error('AI returned invalid JSON response');
      jsonErr.code = 'AI_INVALID_RESPONSE';
      jsonErr.statusCode = 502;
      throw jsonErr;
    }

    try {
      return validateAndNormalizeAiOutput(parsed);
    } catch (validationErr) {
      logger.error('AI output failed validation', { message: validationErr.message });
      const valErr = new Error(`AI output validation failed: ${validationErr.message}`);
      valErr.code = 'AI_VALIDATION_FAILED';
      valErr.statusCode = 502;
      throw valErr;
    }
  };

  const mapField = async (fieldMeta, resumeContext) => {
    if (!fieldMeta || !fieldMeta.label) {
      throw new Error('fieldMeta.label is required');
    }
    if (!resumeContext || typeof resumeContext !== 'object') {
      throw new Error('resumeContext must be an object');
    }

    const prompt = buildFieldMapperPrompt(fieldMeta, resumeContext);

    let rawResponseText;
    try {
      rawResponseText = await resolvedProvider.generateContent(prompt, {
        responseMimeType: 'application/json',
        responseSchema: FIELD_MAPPER_SCHEMA,
      });
    } catch (err) {
      logger.error('AI provider error during field mapping', { code: err.code });
      throw err;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawResponseText);
    } catch {
      logger.error('AI returned invalid JSON for field mapping');
      const jsonErr = new Error('AI returned invalid JSON response');
      jsonErr.code = 'AI_INVALID_RESPONSE';
      jsonErr.statusCode = 502;
      throw jsonErr;
    }

    return validateFieldMappingOutput(parsed);
  };

  return { parseResume, mapField };
};

const VALID_MAPPING_STATUSES = new Set(['mapped', 'uncertain', 'unmapped']);

const validateFieldMappingOutput = (raw) => {
  if (!raw || typeof raw !== 'object') {
    const err = new Error('AI field mapping returned invalid output structure');
    err.code = 'AI_INVALID_RESPONSE';
    err.statusCode = 502;
    throw err;
  }

  let confidence = Number(raw.confidence);
  if (!Number.isFinite(confidence)) confidence = 0;
  confidence = Math.min(1, Math.max(0, confidence));

  let status = typeof raw.status === 'string' ? raw.status.toLowerCase().trim() : 'unmapped';
  if (!VALID_MAPPING_STATUSES.has(status)) status = 'unmapped';

  if (confidence < 0.5 && status === 'mapped') status = 'uncertain';
  if (confidence === 0) status = 'unmapped';

  const resume_path =
    typeof raw.resume_path === 'string' && raw.resume_path.trim()
      ? raw.resume_path.trim().slice(0, 255)
      : null;

  const mapped_value =
    typeof raw.mapped_value === 'string' && raw.mapped_value.trim()
      ? raw.mapped_value.trim().slice(0, 5000)
      : null;

  const finalMappedValue = status === 'unmapped' ? null : mapped_value;
  const finalResumePath = status === 'unmapped' ? null : resume_path;

  const reason =
    typeof raw.reason === 'string' && raw.reason.trim()
      ? raw.reason.trim().slice(0, 2000)
      : 'No reason provided';

  return {
    resume_path: finalResumePath,
    mapped_value: finalMappedValue,
    mapping_method: 'ai',
    confidence,
    reason,
    status,
  };
};

let _instance = null;

const aiService = {
  parseResume: async (rawText) => {
    if (!_instance) _instance = createAiService();
    return _instance.parseResume(rawText);
  },
  mapField: async (fieldMeta, resumeContext) => {
    if (!_instance) _instance = createAiService();
    return _instance.mapField(fieldMeta, resumeContext);
  },
};

module.exports = { createAiService, aiService };